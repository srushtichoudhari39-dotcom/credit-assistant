import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

from app.utils.constants import MANDATORY_DISCLAIMER

load_dotenv()
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

def build_gemini_prompt(financial_data: Dict[str, Any]) -> str:
    """
    Constructs a disciplined, Indian-context prompt for Google Gemini AI.
    Strictly enforces educational guidance principles and compliance rules.
    """
    return f"""You are an educational financial health assistant specializing in the Indian retail credit ecosystem.
Analyze the following user-reported financial snapshot:

=== USER REPORTED FINANCIAL SNAPSHOT ===
- Credit Score: {financial_data.get('credit_score', 'N/A')} (scale: 300 to 900)
- Monthly Gross Income: ₹{financial_data.get('monthly_income', 0):,.2f}
- Monthly Expenses: ₹{financial_data.get('monthly_expenses', 0):,.2f}
- Monthly Debt Payments (EMIs): ₹{financial_data.get('monthly_debt_payment', 0):,.2f}
- Total Outstanding Debt: ₹{financial_data.get('total_debt', 0):,.2f}
- Credit Card Limit: ₹{financial_data.get('credit_limit', 0):,.2f}
- Credit Card Balance: ₹{financial_data.get('credit_balance', 0):,.2f}
- Calculated Debt-to-Income (DTI) Ratio: {financial_data.get('dti_ratio', 0.0):.1f}%
- Calculated Revolving Credit Utilization: {financial_data.get('credit_utilization', 0.0):.1f}%
- Missed Payments Count: {financial_data.get('missed_payments', 0)}
- Number of Active Loans: {financial_data.get('active_loans', 0)}
- Existing Loan Types: {financial_data.get('loan_types', 'None specified')}

=== MANDATORY COMPLIANCE & SAFETY INSTRUCTIONS ===
1. This is strictly educational guidance, NOT certified financial, investment, or legal advice.
2. DO NOT pretend to be an official Indian credit bureau (such as TransUnion CIBIL, Experian, Equifax, or CRIF High Mark) or a bank/lender.
3. NEVER guarantee a specific future credit score, number of points, or specific timeline (e.g. do NOT say "your score will reach 750 in 3 months").
4. DO NOT recommend specific commercial banking products, credit card brands, or high-risk schemes.
5. Clearly distinguish user-reported figures from general credit health educational principles.
6. Clearly state all assumptions made.
7. Emphasize that Indian credit bureaus weigh on-time payment history (~35%) and credit utilization (~30%) heavily.
8. Advise the user to verify all loan accounts and reported statements directly with their respective banks or via official bureau reports.
9. Return output strictly as valid JSON adhering to the specified schema.

=== REQUIRED JSON SCHEMA ===
{{
  "summary": "Concise 2-3 sentence overview of their current credit situation in the Indian ecosystem.",
  "credit_health_status": "Brief status description (e.g. 'Needs Immediate Attention', 'Fair but Elevated Utilization', 'Strong Financial Footing')",
  "bottlenecks": [
    "Bottleneck 1 explaining high utilization, missed payments, or high DTI",
    "Bottleneck 2...",
    "Bottleneck 3..."
  ],
  "recommendations": [
    "Educational recommendation 1...",
    "Educational recommendation 2...",
    "Educational recommendation 3..."
  ],
  "five_step_roadmap": [
    {{
      "step_number": 1,
      "title": "Short title",
      "action": "Specific educational action to take",
      "rationale": "Why this matters in the Indian credit context",
      "timeframe": "e.g. Immediate (Days 1-7)"
    }},
    {{
      "step_number": 2,
      "title": "Short title",
      "action": "Specific educational action to take",
      "rationale": "Why this matters in the Indian credit context",
      "timeframe": "e.g. Month 1"
    }},
    {{
      "step_number": 3,
      "title": "Short title",
      "action": "Specific educational action to take",
      "rationale": "Why this matters in the Indian credit context",
      "timeframe": "e.g. Months 2-3"
    }},
    {{
      "step_number": 4,
      "title": "Short title",
      "action": "Specific educational action to take",
      "rationale": "Why this matters in the Indian credit context",
      "timeframe": "e.g. Months 4-6"
    }},
    {{
      "step_number": 5,
      "title": "Short title",
      "action": "Specific educational action to take",
      "rationale": "Why this matters in the Indian credit context",
      "timeframe": "e.g. Ongoing (6+ months)"
    }}
  ],
  "assumptions": [
    "Assumption regarding accuracy of user-reported balances",
    "Assumption that income remains consistent",
    "Assumption that reported EMIs include all active obligations"
  ],
  "disclaimer": "{MANDATORY_DISCLAIMER}"
}}
"""

def generate_local_fallback_advice(financial_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generates deterministic, high-quality educational financial consultation
    when GEMINI_API_KEY is not configured or remote API is unavailable.
    Guarantees reliable operation and adheres to all compliance requirements.
    """
    score = financial_data.get("credit_score", 700)
    utilization = financial_data.get("credit_utilization", 0.0)
    dti = financial_data.get("dti_ratio", 0.0)
    missed = financial_data.get("missed_payments", 0)
    income = financial_data.get("monthly_income", 0.0)
    debt = financial_data.get("total_debt", 0.0)
    balance = financial_data.get("credit_balance", 0.0)
    limit = financial_data.get("credit_limit", 0.0)

    # Determine status & bottlenecks
    bottlenecks = []
    if missed > 0:
        bottlenecks.append(f"Recorded {missed} missed payment(s), which creates significant downward pressure on credit history.")
    if limit > 0 and balance > limit:
        bottlenecks.append(f"Credit card balance (₹{balance:,.0f}) exceeds total limit (₹{limit:,.0f}), attracting potential penalties.")
    elif utilization > 50.0:
        bottlenecks.append(f"Elevated credit utilization at {utilization:.1f}%, exceeding the bureau-favored 30% ceiling.")
    elif utilization > 30.0:
        bottlenecks.append(f"Credit utilization is moderate ({utilization:.1f}%); bringing it below 30% can optimize scoring.")
    
    if dti > 50.0:
        bottlenecks.append(f"High Debt-to-Income ratio ({dti:.1f}%); over half of gross income is committed to monthly debt payments.")
    elif dti > 35.0:
        bottlenecks.append(f"Moderate Debt-to-Income ratio ({dti:.1f}%); leaves limited cushion for unexpected financial shocks.")
    
    if not bottlenecks:
        bottlenecks.append("No critical bottlenecks detected; focus on consistent ongoing maintenance.")

    # Status summary
    if missed > 0 or utilization > 60.0 or dti > 50.0:
        health_status = "Needs Priority Remediation"
        summary = (
            f"Based on your reported score of {score} and financial metrics, your profile faces headwinds primarily due to "
            f"{'past delinquencies and ' if missed > 0 else ''}elevated utilization ({utilization:.1f}%). "
            "Taking proactive steps towards debt reduction will strengthen your financial foundation in the Indian credit system."
        )
    elif score >= 750 and utilization <= 30.0 and dti <= 35.0:
        health_status = "Strong Credit Profile"
        summary = (
            f"With a reported score of {score}, a low utilization of {utilization:.1f}%, and a healthy DTI of {dti:.1f}%, "
            "your financial indicators are well-aligned with prime borrowing tiers recognized by Indian commercial banks."
        )
    else:
        health_status = "Fair with Optimization Potential"
        summary = (
            f"Your reported credit score of {score} reflects a viable profile with specific opportunities for improvement, "
            f"notably managing revolving balances ({utilization:.1f}%) and maintaining steady debt service capacity."
        )

    recommendations = [
        "Prioritize 100% on-time payments for all active loans and credit cards via automated NACH e-mandates.",
        f"Aim to reduce revolving credit card balance from ₹{balance:,.0f} towards a target utilization below 30% (₹{limit * 0.3:,.0f}).",
        "Refrain from opening unnecessary new credit lines or personal loans while consolidating existing debt.",
        "Obtain your free annual credit report from RBI-licensed bureaus (CIBIL, Experian, Equifax, CRIF High Mark) to verify account accuracy."
    ]

    five_step_roadmap = [
        {
            "step_number": 1,
            "title": "Audit and Settle Past-Due Balances",
            "action": "Verify all credit card bills and loan EMIs. Clear any overdue charges or pending minimums immediately.",
            "rationale": "Timely payment history accounts for roughly 35% of an Indian credit bureau score.",
            "timeframe": "Immediate (Days 1–7)"
        },
        {
            "step_number": 2,
            "title": "Establish Automated Bill Mandates",
            "action": "Configure auto-debit (NACH or net-banking e-mandates) for at least the total monthly minimum due or full statement balance.",
            "rationale": "Prevents inadvertent late payment entries caused by oversight or missed notifications.",
            "timeframe": "Week 2"
        },
        {
            "step_number": 3,
            "title": "Tackle Revolving Card Utilization",
            "action": f"Structure an aggressive repayment plan to lower card balances from ₹{balance:,.0f} to under 30% of total limit.",
            "rationale": "High utilization signals heavy credit dependency to underwriting algorithms.",
            "timeframe": "Months 1–3"
        },
        {
            "step_number": 4,
            "title": "Debt Prepayment & Consolidation Review",
            "action": "Allocate surplus monthly cash flow towards the highest interest obligation (such as personal loans or card revolvers).",
            "rationale": "Lowering outstanding principal directly reduces your Debt-to-Income (DTI) ratio from current {dti:.1f}%.",
            "timeframe": "Months 3–6"
        },
        {
            "step_number": 5,
            "title": "Ongoing Monitoring & Bureau Verification",
            "action": "Check credit statements periodically and avoid hard inquiries for new consumer loans or unsecured cards.",
            "rationale": "Consistent payment discipline over 6 to 12 consecutive months helps build a robust credit standing.",
            "timeframe": "Ongoing (6+ Months)"
        }
    ]

    assumptions = [
        "User-reported monthly income of ₹{:,.2f} is steady and verifiable.".format(income),
        "Reported credit card limit of ₹{:,.2f} and balance of ₹{:,.2f} reflect all active cards.".format(limit, balance),
        "Total debt obligations of ₹{:,.2f} include all formal loans and financing agreements.".format(debt),
        "Educational guidance assumes normal economic conditions and standard Indian banking regulations."
    ]

    return {
        "summary": summary,
        "credit_health_status": health_status,
        "bottlenecks": bottlenecks,
        "recommendations": recommendations,
        "five_step_roadmap": five_step_roadmap,
        "assumptions": assumptions,
        "disclaimer": MANDATORY_DISCLAIMER
    }


async def get_ai_credit_advice(financial_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Coordinates AI consultation.
    If GEMINI_API_KEY is configured, calls the Google Gemini API with a structured prompt.
    If the key is absent or the remote call fails, falls back gracefully to local analysis.
    """
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        logger.info("GEMINI_API_KEY not configured. Using high-fidelity local financial advisor engine.")
        return generate_local_fallback_advice(financial_data)

    prompt = build_gemini_prompt(financial_data)
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload
            )

            if response.status_code == 200:
                data = response.json()
                # Parse candidates text
                candidates = data.get("candidates", [])
                if candidates:
                    first_candidate = candidates[0]
                    parts = first_candidate.get("content", {}).get("parts", [])
                    if parts:
                        text_response = parts[0].get("text", "")
                        parsed_json = json.loads(text_response)
                        # Ensure disclaimer is included
                        parsed_json["disclaimer"] = MANDATORY_DISCLAIMER
                        return parsed_json
            
            logger.warning(
                f"Gemini API returned status {response.status_code}: {response.text[:200]}. Falling back to local engine."
            )
            return generate_local_fallback_advice(financial_data)
            
    except Exception as e:
        logger.error(f"Error communicating with Gemini API: {str(e)}. Falling back to local engine.")
        return generate_local_fallback_advice(financial_data)
