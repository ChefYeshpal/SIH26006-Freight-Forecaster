"""
FastAPI Router for Maritime AI Chatbot & Procurement Decision Assistant
"""

from fastapi import APIRouter, HTTPException
from api.schemas import ChatRequest, ChatResponse
from api.services.chat_service import ChatService

router = APIRouter(prefix="/api/v1/chat", tags=["Maritime AI Assistant & Decision Support"])

@router.post("", response_model=ChatResponse)
def ask_chat_assistant(req: ChatRequest):
    """
    Interactive AI Maritime Copilot:
    - Explains maritime freight & trade terms in simple language (BCI, Route C5, Demurrage, Laytime, etc.)
    - Provides real-time procurement decision support ('CHARTER_NOW' vs 'WAIT')
    - Calculates estimated voyage dollar and rupee savings for given cargo tonnage
    """
    try:
        service = ChatService()
        return service.generate_response(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat assistant error: {str(e)}")

@router.get("/suggestions")
def get_chat_suggestions():
    """
    Returns curated quick suggestion prompts for user interaction
    """
    return {
        "categories": [
            {
                "group": "📖 Terminology & Concepts",
                "prompts": [
                    "What is Baltic Capesize Index (BCI)?",
                    "What is Route C5 vs Route C3?",
                    "What is Demurrage and how is it calculated?",
                    "What is Laytime and Despatch?",
                    "What is VLSFO bunker fuel?",
                    "What is CFR vs FOB shipping?",
                    "What are SHAP values?"
                ]
            },
            {
                "group": "⚡ Procurement Decision Support",
                "prompts": [
                    "Should I charter a vessel now or wait 7 days for Route C5?",
                    "How much can the Ministry save by waiting on a 170k DWT cargo?",
                    "What is our demurrage risk at Paradip and Vizag ports?",
                    "What is the 95% confidence interval for freight next week?"
                ]
            },
            {
                "group": "📊 Market Intelligence",
                "prompts": [
                    "Give me the latest maritime freight snapshot",
                    "How does China PMI impact iron ore freight?",
                    "Why did the model issue a WAIT signal?"
                ]
            }
        ]
    }
