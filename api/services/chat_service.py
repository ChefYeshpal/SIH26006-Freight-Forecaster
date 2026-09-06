"""
Maritime AI Advisory & Terminology Explainer Service
Provides domain knowledge, plain-English glossary definitions, and live chartering decision support.
"""

import re
from typing import Dict, Any, List, Optional
from api.schemas import ChatRequest, ChatResponse
from api.services.forecaster_service import ForecasterService

class ChatService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChatService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.forecaster = ForecasterService()
        self._init_glossary()

    def _init_glossary(self):
        self.glossary: Dict[str, Dict[str, Any]] = {
            "bci": {
                "title": "Baltic Capesize Index (BCI)",
                "summary": "The daily price benchmark for giant cargo ships carrying coal and iron ore.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Think of BCI as the **'Sensex' or 'Stock Market Index' of giant cargo ships**. "
                    "When this number goes **UP**, hiring a ship costs more money. When it goes **DOWN**, hiring a ship becomes cheaper.\n\n"
                    "🚢 **Everyday Analogy:**\n"
                    "Just like Uber cab fares increase during rain or rush hour (surge pricing), the BCI goes up when global demand for shipping raw materials is high.\n\n"
                    "🇮🇳 **Why It Matters to Ministry of Steel:**\n"
                    "Indian steel plants import millions of tonnes of coking coal from Australia. If BCI drops by 200 points, our government saves **₹2 Crores to ₹5 Crores** on a single ship charter.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Check BCI before booking. If BCI is falling, **WAIT** to get cheaper shipping rates."
                ),
                "follow_ups": ["What is BDI?", "What is Route C5?", "Should I charter now or wait?"]
            },
            "bdi": {
                "title": "Baltic Dry Index (BDI)",
                "summary": "The overall health indicator of global ocean shipping across all dry cargo ships.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "BDI is the **average shipping price across all sizes of dry cargo ships** (small, medium, and giant) across the entire world.\n\n"
                    "🚢 **Everyday Analogy:**\n"
                    "If BCI is just the price of giant 18-wheeler trucks, BDI is the average price of all transport vehicles (tempos, trucks, and trailers combined).\n\n"
                    "🇮🇳 **Why It Matters to Ministry of Steel:**\n"
                    "When BDI is high, world trade is booming and shipowners charge high prices. When BDI drops, it means cargo demand has slowed down, giving the Ministry of Steel strong bargaining power to negotiate lower shipping rates.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "A falling BDI means you have the upper hand to demand discounts from shipowners."
                ),
                "follow_ups": ["What is BCI?", "What is Capesize?", "What is Route C3?"]
            },
            "route c5": {
                "title": "Baltic Route C5 (West Australia → East Coast India/Asia)",
                "summary": "The exact freight rate in dollars per tonne to transport iron ore from Australia to India.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Route C5 is the **exact delivery cost per tonne** for shipping iron ore from Western Australia (Port Hedland) to Indian ports like Paradip and Visakhapatnam.\n\n"
                    "💵 **How It Works (With Numbers):**\n"
                    "- **Current Rate:** Typically **$10 to $16 USD per tonne**.\n"
                    "- **Sailing Time:** 11 to 14 days across the Indian Ocean.\n"
                    "- **Typical Cargo:** 170,000 tonnes of Iron Ore per voyage.\n\n"
                    "🇮🇳 **Why It Matters to Ministry of Steel:**\n"
                    "If our AI model predicts Route C5 will drop by just **$1.50 per tonne**, and you wait 7 days to tender, the Ministry saves:\n"
                    "$$\\text{170,000 tonnes} \\times \\$1.50 = \\mathbf{\\$255,000\\text{ USD (}\\approx \\text{₹2.12 Crores)}}$$\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "This is the most critical route for Indian steelmaking raw material imports."
                ),
                "follow_ups": ["What is Route C3?", "What is Demurrage?", "Calculate savings for 170k DWT"]
            },
            "route c3": {
                "title": "Baltic Route C3 (Brazil → East Coast India/Asia)",
                "summary": "Long-haul ocean freight rate for shipping iron ore from Brazil to India.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Route C3 is the shipping cost to bring iron ore from Brazil (Tubarão port) to India. Because Brazil is on the other side of the planet, this is a **long 35 to 40-day voyage**.\n\n"
                    "🚢 **Everyday Analogy:**\n"
                    "If Route C5 (Australia $\\rightarrow$ India) is like a flight from Delhi to Mumbai, Route C3 (Brazil $\\rightarrow$ India) is like a flight from Delhi to New York.\n\n"
                    "💵 **Price Difference:**\n"
                    "- Costs much more: **$22 to $32 per tonne** (double the Australian route).\n"
                    "- Very sensitive to global fuel prices because the ship burns fuel for over a month.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Whenever possible, sourcing ore from Australia (C5) saves over 50% in freight compared to Brazil (C3)."
                ),
                "follow_ups": ["What is Route C5?", "What is VLSFO?", "What is Capesize?"]
            },
            "demurrage": {
                "title": "Demurrage (Port Delay Penalty)",
                "summary": "The heavy daily fine paid to the shipowner if your ship is stuck waiting at the port.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Demurrage is a **late-fee fine**. If a cargo ship arrives at Paradip or Vizag port and has to wait at sea because berths are full, the government must pay the shipowner **every single day it waits**.\n\n"
                    "⚠️ **How Much Does It Cost?**\n"
                    "- Standard Capesize Demurrage: **$25,000 to $35,000 USD per day**.\n"
                    "- That is **₹20 Lakhs to ₹29 Lakhs per day** per ship!\n\n"
                    "🇮🇳 **Real Ministry Scenario:**\n"
                    "If 2 vessels wait 5 days at Paradip port due to berth congestion:\n"
                    "$$2\\text{ vessels} \\times 5\\text{ days} \\times \\$30,000 = \\mathbf{\\$300,000\\text{ USD (}\\approx \\text{₹2.5 Crores)}}\\text{ wasted in penalties!}$$\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Our AI model predicts port congestion so you schedule ship arrivals only when berths are free."
                ),
                "follow_ups": ["What is Laytime?", "What is Despatch?", "How does port congestion affect decisions?"]
            },
            "laytime": {
                "title": "Laytime (Free Allowed Port Time)",
                "summary": "The agreed number of days allowed to unload the ship without any late fees.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Laytime is the **'free parking time'** written in the contract. For example, the contract says the port has **5 days** to unload all 170,000 tonnes of coal.\n\n"
                    "⏱️ **The Rules:**\n"
                    "- If you unload in **under 5 days** $\\rightarrow$ You get a cash reward called **Despatch**.\n"
                    "- If you take **more than 5 days** $\\rightarrow$ You pay a heavy penalty called **Demurrage**.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Fast unloading earns money back; slow unloading triggers heavy fines."
                ),
                "follow_ups": ["What is Demurrage?", "What is Despatch?"]
            },
            "despatch": {
                "title": "Despatch (Early Completion Bonus)",
                "summary": "Cash bonus paid by the shipowner to the steel plant for unloading faster than expected.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Despatch is the **opposite of Demurrage**. It is a **cash reward** you earn for being fast.\n\n"
                    "💵 **How It Works:**\n"
                    "- Usually set at **50% of the demurrage rate** (~$12,500 to $15,000 USD per day saved).\n"
                    "- If Paradip port unloads a ship 2 days ahead of schedule, the shipowner returns **~$25,000 USD (~₹20 Lakhs)** back to the ministry.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "High-speed mechanized unloading saves demurrage AND earns despatch rebates."
                ),
                "follow_ups": ["What is Demurrage?", "What is Laytime?"]
            },
            "capesize": {
                "title": "Capesize Vessels (>150,000 DWT)",
                "summary": "The giant ocean cargo ships used to transport bulk iron ore and coal.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Capesize ships are the **biggest cargo vessels on the ocean**. They are so massive they cannot fit through the Panama Canal!\n\n"
                    "📏 **How Big Are They?**\n"
                    "- **Length:** Nearly 3 football fields long (~290 meters).\n"
                    "- **Carrying Capacity:** Up to **170,000 to 200,000 tonnes** in a single trip.\n"
                    "- **Cargo:** Almost exclusively **Iron Ore and Coking Coal**.\n\n"
                    "🇮🇳 **Why It Matters to Ministry of Steel:**\n"
                    "Because they carry huge volumes, they offer the **cheapest freight cost per tonne**. However, only deepwater ports like Paradip and Visakhapatnam can handle them.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Capesize = Maximum cargo volume, lowest freight cost per tonne."
                ),
                "follow_ups": ["What is DWT?", "What is Panamax?", "What is Route C5?"]
            },
            "panamax": {
                "title": "Panamax Vessels (65k – 85k DWT)",
                "summary": "Medium-sized bulk cargo ships designed to fit through the Panama Canal.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Panamax ships are **medium-sized cargo ships** (about half the size of a Capesize). They carry ~70,000 tonnes of cargo.\n\n"
                    "🚢 **When Are They Used?**\n"
                    "When shipping to smaller or shallower Indian ports (like Haldia) where giant Capesize ships would run aground in shallow water.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Panamax = Flexible for shallower ports, but costs slightly more per tonne than Capesize."
                ),
                "follow_ups": ["What is Capesize?", "What is Supramax?"]
            },
            "supramax": {
                "title": "Supramax Vessels (50k – 65k DWT)",
                "summary": "Handy cargo ships equipped with their own onboard cranes.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Supramax ships are **self-sufficient ships equipped with their own cranes on deck**. They can load and unload cargo even at primitive ports that have no shore cranes.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Used for minor raw materials like limestone, manganese ore, or dolomite."
                ),
                "follow_ups": ["What is Capesize?", "What is Panamax?"]
            },
            "dwt": {
                "title": "Deadweight Tonnage (DWT)",
                "summary": "The total maximum weight a ship can carry safely.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "DWT is the **maximum load capacity of the ship in metric tonnes**.\n\n"
                    "⚖️ **What It Includes:**\n"
                    "Cargo + Fuel (Bunkers) + Crew + Fresh Water.\n"
                    "For example, a **180,000 DWT Capesize ship** carries approximately **170,000 tonnes of iron ore**, with the remaining 10,000 tonnes reserved for fuel and water.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Higher DWT means a bigger ship and more raw materials brought in a single trip."
                ),
                "follow_ups": ["What is Capesize?", "Calculate savings for 170k DWT"]
            },
            "vlsfo": {
                "title": "VLSFO (Very Low Sulphur Fuel Oil)",
                "summary": "The fuel burned by cargo ships, accounting for half of the shipping cost.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "VLSFO is the **marine diesel fuel** that powers cargo ships across the ocean.\n\n"
                    "⛽ **Why It Matters:**\n"
                    "Fuel accounts for **40% to 60% of the entire ship hire cost**. When oil prices rise in Singapore, shipowners immediately charge higher freight rates per tonne to cover fuel expenses.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "When bunker fuel prices fall, ocean freight rates usually drop shortly after."
                ),
                "follow_ups": ["What is Route C5?", "What is Route C3?"]
            },
            "cfr vs fob": {
                "title": "CFR vs FOB (Who Pays the Shipping?)",
                "summary": "The difference between buying raw material with shipping included vs hiring your own ship.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "- **FOB (Free on Board):** You buy the coal at the foreign port and **hire your own ship**. You control the shipping schedule and save money by timing the market!\n"
                    "- **CFR (Cost & Freight):** The seller arranges the ship and adds a fat shipping fee to your bill.\n\n"
                    "🇮🇳 **Strategic Value for Ministry of Steel:**\n"
                    "Foreign suppliers often overcharge on CFR shipping. By switching to **FOB contracts** and using our AI tool to charter ships at low points, the Ministry saves **10% to 25% on shipping bills**.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "FOB gives the government full control to save millions of dollars using AI forecasting."
                ),
                "follow_ups": ["Should I charter now or wait?", "What is Route C5?"]
            },
            "shap": {
                "title": "SHAP (Explainable AI - Why the Model Made a Decision)",
                "summary": "The tool that proves to officers exactly why the AI predicted rates will rise or fall.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Normally, AI is a 'black box' (you don't know why it made a choice). **SHAP opens the black box and shows the math**.\n\n"
                    "📊 **Example Breakdown:**\n"
                    "If the AI says: *'Route C5 will drop by $1.50 next week'*, SHAP shows:\n"
                    "- Fuel price dropped: `-$0.60`\n"
                    "- West Australia ship supply increased: `-$0.70`\n"
                    "- Paradip port wait increased: `+$0.20`\n"
                    "- **Total Net Change: `-$1.50`**\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Gives government procurement officers an auditable, transparent explanation for tenders."
                ),
                "follow_ups": ["What is Confidence Interval?", "Why is the signal WAIT?"]
            },
            "confidence interval": {
                "title": "95% Confidence Interval (Safety Range)",
                "summary": "The guaranteed statistical safety range where the future price will land.",
                "explanation": (
                    "💡 **In Simple Words:**\n"
                    "Instead of giving just one risky guess, the AI gives an **upper and lower safety bracket** with 95% certainty.\n\n"
                    "📊 **Example:**\n"
                    "Prediction: **$13.35 / tonne**\n"
                    "Safety Band: **[$12.10 to $14.60]**\n"
                    "This tells the procurement committee that even in the worst-case market surge, the freight will not exceed **$14.60**.\n\n"
                    "📌 **Clear Takeaway:**\n"
                    "Allows risk officers to budget with complete financial peace of mind."
                ),
                "follow_ups": ["What is SHAP?", "Should I charter now or wait?"]
            }
        }

    def generate_response(self, req: ChatRequest) -> ChatResponse:
        text = req.message.strip().lower()
        route = req.route.upper() if req.route else "C5"
        cargo_tonnes = req.cargo_tonnes or 170000.0

        # 1. Check for explicit decision/tendering intent first
        is_decision_query = any(phrase in text for phrase in [
            "should i", "charter now", "wait or charter", "charter or wait", "when to charter",
            "when to tender", "when to book", "should we charter", "should we wait", "advise on charter",
            "chartering decision", "tender recommendation"
        ]) or (("charter" in text or "tender" in text or "book" in text) and ("wait" in text or "now" in text or "delay" in text))

        if is_decision_query:
            return self._handle_decision_query(req)

        # 2. Check for Terminology / Glossary Inquiries
        glossary_match = self._match_glossary(text)
        if glossary_match:
            item = self.glossary[glossary_match]
            reply = f"### 📖 {item['title']}\n\n{item['explanation']}"
            return ChatResponse(
                reply=reply,
                category="glossary",
                follow_up_suggestions=item.get("follow_ups", ["Should I charter now or wait?", "What is Route C5?", "What is Demurrage?"])
            )

        # 3. Check for general Decision queries
        if any(w in text for w in ["charter", "tender", "book", "decision", "recommend", "timing", "advice", "buy"]):
            return self._handle_decision_query(req)


        # 3. Check for Savings / Cost Calculation
        if any(w in text for w in ["saving", "calculate", "cost", "tonnes", "tonne", "rupee", "crore", "dollar", "how much"]):
            return self._handle_savings_query(req)

        # 4. Check for Port Congestion or Demurrage Specific Queries
        if any(w in text for w in ["congestion", "paradip", "vizag", "visakhapatnam", "haldia", "delay", "wait time", "demurrage"]):
            return self._handle_congestion_query(req)

        # 5. Check for Market Snapshot / Trends
        if any(w in text for w in ["market", "trend", "current", "latest", "status", "price", "rate", "forecast"]):
            return self._handle_market_query(req)

        # Default Helpful Maritime Assistant Response
        snapshot = self.forecaster.get_market_snapshot()
        reply = (
            f"Hello! I am your **NMFIS Maritime AI Advisory Assistant** for the Ministry of Steel.\n\n"
            f"I can help you with:\n"
            f"1. **Explaining Shipping Terms:** Ask about *BCI, Route C5, Demurrage, Laytime, Capesize, VLSFO, CFR vs FOB, SHAP*, etc.\n"
            f"2. **Procurement Decisions:** Ask *'Should I charter a Capesize now or wait 7 days?'*\n"
            f"3. **Cost & Savings Estimations:** Ask *'How much can we save on 170,000 tonnes of iron ore?'*\n\n"
            f"**Current Spot Baseline:** Route C5 is **${snapshot.route_c5_usd_per_tonne} / tonne**, "
            f"Route C3 is **${snapshot.route_c3_usd_per_tonne} / tonne**, and BCI is **{snapshot.bci_index:,} pts**."
        )
        return ChatResponse(
            reply=reply,
            category="general",
            follow_up_suggestions=[
                "Should I charter now or wait for Route C5?",
                "What is the difference between Route C5 and C3?",
                "What is Demurrage and how to avoid it?",
                "Explain Baltic Capesize Index (BCI)"
            ]
        )

    def _match_glossary(self, text: str) -> Optional[str]:
        for term in sorted(self.glossary.keys(), key=len, reverse=True):
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, text):
                return term
        # Fuzzy checks for common phrasing
        if "c5" in text and "route" in text:
            return "route c5"
        if "c3" in text and "route" in text:
            return "route c3"
        if "cfr" in text or "fob" in text:
            return "cfr vs fob"
        return None

    def _handle_decision_query(self, req: ChatRequest) -> ChatResponse:
        from api.schemas import ForecastRequest
        route = req.route.upper() if req.route in ["C5", "C3", "BCI"] else "C5"
        cargo = req.cargo_tonnes or 170000.0

        # Run 7-day forecast to get current AI signal
        forecast_req = ForecastRequest(horizon_days=7, route=route)
        pred = self.forecaster.predict_freight(forecast_req)
        rec = pred.recommendation

        spot = pred.current_spot_rate
        target = pred.predicted_rate
        diff_per_tonne = abs(spot - target)
        
        # Calculate savings
        if route != "BCI":
            total_savings_usd = round(diff_per_tonne * cargo, 2)
            total_savings_inr_cr = round((total_savings_usd * 83.5) / 10000000.0, 2)
            unit = "$/tonne"
        else:
            total_savings_usd = 0.0
            total_savings_inr_cr = 0.0
            unit = "pts"

        action = rec.action
        badge_symbol = "🟢" if action == "CHARTER_NOW" else ("🔴" if action == "WAIT" else "⚪")

        if action == "CHARTER_NOW":
            verdict_text = "CHARTER NOW (Book Vessel Immediately)"
            why_text = f"Freight rates on **{route}** are expected to rise by **+{rec.expected_change_pct}%** over the next 7 business days."
            step_text = (
                "1. ⚡ **Issue tender inquiries immediately** to lock in today's lower spot freight.\n"
                f"2. 🛡️ **Avoid paying an extra ${total_savings_usd:,.0f} USD (~₹{total_savings_inr_cr:.2f} Cr)** by securing vessels before shipowners hike their rates.\n"
                "3. 📝 Prefer a firm lump-sum or fixed voyage charter."
            )
        elif action == "WAIT":
            verdict_text = "WAIT & DELAY TENDER (Hold for 4 to 7 Days)"
            why_text = f"Freight rates on **{route}** are projected to drop by **{rec.expected_change_pct}%** over the next week (from ${spot:.2f} down to ${target:.2f} {unit})."
            step_text = (
                "1. 🛑 **Hold back spot inquiries** for the next 4 to 7 business days.\n"
                f"2. 💵 **Capture ~₹{total_savings_inr_cr:.2f} Crores in direct savings** on your {cargo:,.0f} MT cargo as vessel supply loosens.\n"
                "3. ⚓ If shipment cannot wait, negotiate an **Index-Linked (Floating) charter** to automatically get the lower rate."
            )
        else:
            verdict_text = "HOLD NEUTRAL (Normal Procurement Cadence)"
            why_text = f"Freight rates on **{route}** are stable and range-bound ({rec.expected_change_pct:+.1f}% change)."
            step_text = (
                "1. 🗓️ Proceed with your regular procurement schedule without rush or delay.\n"
                "2. 🔍 Re-check forecasts before finalizing the contract award."
            )

        reply = (
            f"### {badge_symbol} Recommended Action: **{verdict_text}**\n\n"
            f"| Metric | Spot Rate (Today) | Forecast (In 7 Days) | Expected Change |\n"
            f"| :--- | :--- | :--- | :--- |\n"
            f"| **{route} Freight** | **${spot:.2f} {unit}** | **${target:.2f} {unit}** | **{rec.expected_change_pct:+.1f}%** |\n\n"
            f"💡 **Why This Decision?**\n"
            f"{why_text}\n\n"
            f"💰 **Financial Impact on {cargo:,.0f} MT Cargo:**\n"
            f"- **Rate Difference:** **${diff_per_tonne:.2f} / tonne**\n"
            f"- **Net Financial Value:** **${total_savings_usd:,.2f} USD**\n"
            f"- **Indian Rupee Value:** **~₹{total_savings_inr_cr:.2f} Crores**\n\n"
            f"📋 **Recommended Next Steps:**\n"
            f"{step_text}\n\n"
            f"🛡️ *95% Confidence Uncertainty Safety Band: `[{pred.confidence_interval_95pct['lower']} to {pred.confidence_interval_95pct['upper']} {unit}]`*"
        )


        return ChatResponse(
            reply=reply,
            category="decision_support",
            action_signal=action,
            estimated_savings_usd=total_savings_usd if total_savings_usd > 0 else None,
            estimated_savings_inr_cr=total_savings_inr_cr if total_savings_inr_cr > 0 else None,
            follow_up_suggestions=[
                f"How much will we save if we wait 14 days?",
                f"What is the demurrage risk at Paradip port?",
                f"Why did the model predict rates will {'rise' if action=='CHARTER_NOW' else 'fall'}?",
                f"Explain Route {route}"
            ]
        )

    def _handle_savings_query(self, req: ChatRequest) -> ChatResponse:
        cargo = req.cargo_tonnes or 170000.0
        route = req.route.upper() if req.route in ["C5", "C3"] else "C5"
        
        from api.schemas import ForecastRequest
        pred_7d = self.forecaster.predict_freight(ForecastRequest(horizon_days=7, route=route))
        diff_7d = abs(pred_7d.predicted_rate - pred_7d.current_spot_rate)
        savings_usd = diff_7d * cargo
        savings_inr_cr = (savings_usd * 83.5) / 10000000.0

        reply = (
            f"### 💰 Cargo Financial Impact Calculator\n\n"
            f"- **Route Evaluated:** {route} (Current Spot: **${pred_7d.current_spot_rate:.2f} / tonne**)\n"
            f"- **Cargo Size:** **{cargo:,.0f} Metric Tonnes** (Standard Capesize Bulker)\n"
            f"- **Forecasted Rate in 7 Days:** **${pred_7d.predicted_rate:.2f} / tonne** ({pred_7d.expected_change_pct:+.1f}%)\n\n"
            f"**Estimated Financial Delta:**\n"
            f"- **Per Tonne Difference:** **${diff_7d:.2f} / tonne**\n"
            f"- **Total Voyage Impact:** **${savings_usd:,.2f} USD**\n"
            f"- **Indian Rupee Equivalent:** **₹{savings_inr_cr:.2f} Crores**\n\n"
            f"> 💡 **Procurement Rule of Thumb:** For the Ministry of Steel's annual ~130M tonnes imports, a \$1.00/t timing optimization equals **\$130,000,000 USD (~₹1,085 Crores)** in government logistics savings."
        )

        return ChatResponse(
            reply=reply,
            category="decision_support",
            estimated_savings_usd=round(savings_usd, 2),
            estimated_savings_inr_cr=round(savings_inr_cr, 2),
            follow_up_suggestions=[
                "Should I charter now or wait for Route C5?",
                "What is Demurrage?",
                "What is Route C5 vs C3?"
            ]
        )

    def _handle_congestion_query(self, req: ChatRequest) -> ChatResponse:
        snapshot = self.forecaster.get_market_snapshot()
        wait_days = snapshot.port_congestion_east_india_days
        demurrage_per_day = 28000.0
        demurrage_total = wait_days * demurrage_per_day
        demurrage_inr = (demurrage_total * 83.5) / 100000.0  # Lakhs

        reply = (
            f"### ⚓ East Coast India Port Congestion & Demurrage Analysis\n\n"
            f"- **Monitored Ports:** Paradip, Visakhapatnam (Vizag), Kamarajar (Ennore), Haldia\n"
            f"- **Current Estimated Anchorage Queue:** **{wait_days:.1f} days**\n"
            f"- **Benchmark Capesize Demurrage Rate:** **${demurrage_per_day:,.0f} USD / day**\n\n"
            f"**Financial Demurrage Exposure:**\n"
            f"If a Capesize vessel arrives today, the anticipated anchorage waiting penalty before berthing is **~${demurrage_total:,.0f} USD (~₹{demurrage_inr:.1f} Lakhs)**.\n\n"
            f"**Strategic Advice:**\n"
            f"1. Coordinate tender laycan (arrival window) with port discharge schedules to arrive during green queue slots (<2.5 days).\n"
            f"2. For Paradip deep-draft berths, ensure mechanized unloading grabs are reserved in advance."
        )

        return ChatResponse(
            reply=reply,
            category="market_insight",
            follow_up_suggestions=[
                "What is Demurrage & Laytime?",
                "Should I charter now or wait?",
                "Explain Route C5"
            ]
        )

    def _handle_market_query(self, req: ChatRequest) -> ChatResponse:
        s = self.forecaster.get_market_snapshot()
        reply = (
            f"### 📊 Live Maritime & Economic Market Snapshot\n\n"
            f"| Indicator | Current Value | Market Context |\n"
            f"| :--- | :--- | :--- |\n"
            f"| **Baltic Capesize (BCI)** | **{s.bci_index:,} pts** | Primary Capesize freight benchmark |\n"
            f"| **Baltic Dry (BDI)** | **{s.bdi_index:,} pts** | Overall dry bulk market indicator |\n"
            f"| **Route C5 (W. Aus $\\rightarrow$ India)** | **${s.route_c5_usd_per_tonne:.2f} / t** | Key iron ore import route |\n"
            f"| **Route C3 (Brazil $\\rightarrow$ India)** | **${s.route_c3_usd_per_tonne:.2f} / t** | Long-haul Atlantic freight |\n"
            f"| **Iron Ore (62% Fe CFR)** | **${s.iron_ore_price_usd:.2f} / t** | Steel demand driver |\n"
            f"| **VLSFO Bunker Fuel** | **${s.bunker_fuel_vlsfo_usd:.2f} / t** | 45% of shipowner voyage costs |\n"
            f"| **East Coast Port Delay** | **{s.port_congestion_east_india_days:.1f} days** | Paradip/Vizag anchorage queue |\n"
            f"| **China Manufacturing PMI** | **{s.china_manufacturing_pmi:.2f}** | Global demand pulse (>50 = expansion) |\n"
            f"| **USD / INR** | **₹{s.usd_inr:.2f}** | Currency exchange rate |\n"
        )
        return ChatResponse(
            reply=reply,
            category="market_insight",
            follow_up_suggestions=[
                "Should I charter now or wait for Route C5?",
                "What is Route C5?",
                "What is Demurrage?"
            ]
        )
