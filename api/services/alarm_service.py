"""
Alarm Evaluation and Notification Service for SIH26006 Freight Forecasting System.
Evaluates user-configured alarm rules against real-time market snapshots and forecasts.
Dispatches email alerts via SMTP relay.
"""

import os
import smtplib
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List

from api.schemas import (
    AlarmRule,
    AlarmTrigger,
    AlarmEvaluateResponse,
    AlarmEmailRequest,
    ForecastRequest
)
from api.services.forecaster_service import ForecasterService

METRIC_LABELS = {
    "bci_index": "Baltic Capesize Index (BCI)",
    "route_c5_usd_per_tonne": "Route C5 Freight ($/t)",
    "route_c3_usd_per_tonne": "Route C3 Freight ($/t)",
    "iron_ore_price_usd": "Iron Ore 62% Fe ($/t)",
    "port_congestion_east_india_days": "East Coast India Port Wait (Days)",
    "bunker_fuel_vlsfo_usd": "VLSFO Bunker Fuel ($/t)",
    "charter_signal": "Procurement Chartering Signal"
}


class AlarmService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AlarmService, cls).__new__(cls)
        return cls._instance

    def evaluate(self, rules: List[AlarmRule]) -> AlarmEvaluateResponse:
        """
        Evaluates active rules against latest market conditions and AI forecast.
        """
        forecaster = ForecasterService()
        snapshot = forecaster.get_market_snapshot()
        forecast_7d = forecaster.predict_freight(ForecastRequest(horizon_days=7, route="C5"))

        triggered: List[AlarmTrigger] = []
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        for rule in rules:
            if not rule.enabled:
                continue

            current_val = 0.0
            is_triggered = False
            msg = ""
            severity = "warning"

            # 1. Charter Signal Rule
            if rule.metric == "charter_signal" or rule.condition == "signal_equals":
                rec_action = forecast_7d.recommendation.action  # "CHARTER_NOW", "WAIT", "HOLD_NEUTRAL"
                target_sig = (rule.signal_value or "CHARTER_NOW").upper()
                if rec_action == target_sig:
                    is_triggered = True
                    current_val = 1.0
                    severity = "critical" if rec_action == "CHARTER_NOW" else "high"
                    msg = f"AI Chartering recommendation is {rec_action}: {forecast_7d.recommendation.rationale}"
            else:
                # 2. Market Metric Rules
                metric_map = {
                    "bci_index": snapshot.bci_index,
                    "route_c5_usd_per_tonne": snapshot.route_c5_usd_per_tonne,
                    "route_c3_usd_per_tonne": snapshot.route_c3_usd_per_tonne,
                    "iron_ore_price_usd": snapshot.iron_ore_price_usd,
                    "port_congestion_east_india_days": snapshot.port_congestion_east_india_days,
                    "bunker_fuel_vlsfo_usd": snapshot.bunker_fuel_vlsfo_usd,
                }

                current_val = float(metric_map.get(rule.metric, 0.0))
                thresh = float(rule.threshold)

                if rule.condition == "above" and current_val > thresh:
                    is_triggered = True
                    pct_over = ((current_val - thresh) / thresh) * 100 if thresh > 0 else 0
                    severity = "critical" if pct_over > 15 else ("high" if pct_over > 5 else "warning")
                    msg = f"{METRIC_LABELS.get(rule.metric, rule.metric)} reached {current_val}, surpassing threshold of {thresh}"

                elif rule.condition == "below" and current_val < thresh:
                    is_triggered = True
                    pct_under = ((thresh - current_val) / thresh) * 100 if thresh > 0 else 0
                    severity = "critical" if pct_under > 15 else ("high" if pct_under > 5 else "warning")
                    msg = f"{METRIC_LABELS.get(rule.metric, rule.metric)} dropped to {current_val}, falling below threshold of {thresh}"

                elif rule.condition in ("change_pct_above", "change_pct_below"):
                    # Calculate 7-day rate of change using historical dataframe if available
                    past_val = current_val
                    if hasattr(forecaster, "df") and len(forecaster.df) >= 8 and rule.metric in forecaster.df.columns:
                        past_val = float(forecaster.df.iloc[-8][rule.metric])
                    pct_chg = ((current_val - past_val) / past_val) * 100.0 if past_val > 0 else 0.0

                    if rule.condition == "change_pct_above" and pct_chg > thresh:
                        is_triggered = True
                        severity = "critical" if pct_chg > (thresh + 10) else ("high" if pct_chg > (thresh + 5) else "warning")
                        msg = f"{METRIC_LABELS.get(rule.metric, rule.metric)} rose by {pct_chg:+.1f}% in 7 days (threshold: +{thresh}%)"

                    elif rule.condition == "change_pct_below" and pct_chg < -abs(thresh):
                        is_triggered = True
                        severity = "critical" if abs(pct_chg) > (abs(thresh) + 10) else ("high" if abs(pct_chg) > (abs(thresh) + 5) else "warning")
                        msg = f"{METRIC_LABELS.get(rule.metric, rule.metric)} fell by {abs(pct_chg):.1f}% in 7 days (threshold: -{abs(thresh)}%)"

            if is_triggered:
                triggered.append(
                    AlarmTrigger(
                        rule_id=rule.id,
                        rule_name=rule.name,
                        metric=rule.metric,
                        metric_label=METRIC_LABELS.get(rule.metric, rule.metric),
                        current_value=current_val,
                        threshold=rule.threshold,
                        condition=rule.condition,
                        severity=severity,
                        message=msg,
                        triggered_at=now_str
                    )
                )

        return AlarmEvaluateResponse(
            triggered=triggered,
            evaluated_at=now_str,
            total_rules=len(rules),
            total_triggered=len(triggered)
        )

    def send_email(self, req: AlarmEmailRequest) -> dict:
        """
        Sends an alert notification email via configured SMTP relay.
        """
        smtp_host = os.getenv("ALARM_SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("ALARM_SMTP_PORT", 587))
        smtp_user = os.getenv("ALARM_SMTP_USER", "")
        smtp_pass = os.getenv("ALARM_SMTP_PASS", "")

        if not smtp_user or not smtp_pass:
            return {
                "status": "simulated",
                "message": f"SMTP credentials not configured in environment. Alert email for {req.to_email} logged successfully.",
                "recipient": req.to_email,
                "trigger_count": len(req.triggers)
            }

        try:
            template_path = os.path.join("api", "templates", "alarm_email.html")
            html_body = ""
            if os.path.exists(template_path):
                with open(template_path, "r", encoding="utf-8") as f:
                    template_content = f.read()

                # Basic render for simple placeholder matching
                rows_html = ""
                for t in req.triggers:
                    rows_html += f"""
                    <tr>
                        <td><strong>{t.rule_name}</strong><br><span style="font-size:11px;color:#64748b;">{t.message}</span></td>
                        <td>{t.metric_label}</td>
                        <td><strong>{t.current_value}</strong></td>
                        <td>{t.condition} {t.threshold}</td>
                        <td><span class="badge badge-{t.severity}">{t.severity.upper()}</span></td>
                    </tr>
                    """

                now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
                html_body = template_content.replace("{{ total_triggered }}", str(len(req.triggers)))
                html_body = html_body.replace("{{ evaluated_at }}", now_str)
                # replace tbody placeholder
                tbody_start = html_body.find("<tbody>")
                tbody_end = html_body.find("</tbody>")
                if tbody_start != -1 and tbody_end != -1:
                    html_body = html_body[:tbody_start + 7] + rows_html + html_body[tbody_end:]
            else:
                html_body = f"<h2>Freight Forecaster Alert</h2><p>{len(req.triggers)} alarms fired.</p>"

            msg = MIMEMultipart("alternative")
            msg["Subject"] = req.subject
            msg["From"] = f"Freight Forecaster Alerts <{smtp_user}>"
            msg["To"] = req.to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [req.to_email], msg.as_string())

            return {"status": "sent", "recipient": req.to_email, "trigger_count": len(req.triggers)}
        except Exception as e:
            return {"status": "error", "error": str(e)}
