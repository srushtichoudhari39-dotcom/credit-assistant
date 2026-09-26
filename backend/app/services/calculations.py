from typing import Optional, Dict, Any, List
from app.utils.constants import (
    get_credit_score_status,
    get_dti_status,
    get_utilization_status,
)

def calculate_dti(monthly_debt_payment: float, monthly_income: float) -> float:
    """
    Calculates Debt-to-Income (DTI) Ratio as a percentage.
    Formula: (Total Monthly Debt Payments / Gross Monthly Income) * 100
    Returns 0.0 if monthly_income is non-positive to prevent division by zero.
    """
    if monthly_income <= 0:
        return 0.0
    return round((monthly_debt_payment / monthly_income) * 100.0, 2)


def calculate_credit_utilization(credit_balance: float, credit_limit: float) -> float:
    """
    Calculates Revolving Credit Utilization as a percentage.
    Formula: (Outstanding Credit Card Balance / Total Credit Limit) * 100
    Returns 0.0 if credit_limit is non-positive to prevent division by zero.
    """
    if credit_limit <= 0:
        return 0.0
    return round((credit_balance / credit_limit) * 100.0, 2)


def identify_bottlenecks(
    credit_score: int,
    credit_utilization: float,
    dti_ratio: float,
    missed_payments: int,
    credit_balance: float,
    credit_limit: float
) -> List[Dict[str, Any]]:
    """
    Identifies financial bottlenecks based on Indian credit evaluation rules.
    """
    bottlenecks = []

    # 1. Missed Payments bottleneck (most severe impact on CIBIL/Experian score)
    if missed_payments > 0:
        bottlenecks.append({
            "code": "MISSED_PAYMENTS",
            "title": f"{missed_payments} Missed Payment{'s' if missed_payments > 1 else ''} Recorded",
            "severity": "critical",
            "impact": "High Negative Impact",
            "description": (
                "Payment history accounts for roughly 30-35% of your credit score in India. "
                "Delinquencies remain on bureau reports for up to 36 months."
            ),
            "recommendation": "Bring all past-due accounts current immediately and set up auto-debit (NACH/e-mandate)."
        })

    # 2. High Credit Utilization bottleneck
    if credit_limit > 0 and credit_balance > credit_limit:
        bottlenecks.append({
            "code": "OVER_LIMIT",
            "title": "Credit Limit Exceeded",
            "severity": "critical",
            "impact": "High Negative Impact",
            "description": f"Outstanding balance of ₹{credit_balance:,.0f} exceeds your sanctioned limit of ₹{credit_limit:,.0f}.",
            "recommendation": "Pay down the excess balance immediately to avoid over-limit fees and heavy bureau penalties."
        })
    elif credit_utilization > 50.0:
        bottlenecks.append({
            "code": "HIGH_UTILIZATION",
            "title": f"Elevated Credit Utilization ({credit_utilization:.1f}%)",
            "severity": "warning",
            "impact": "Moderate to High Negative Impact",
            "description": "Utilizing over 50% of your credit limit signals credit hunger and high dependence on revolving debt.",
            "recommendation": "Aim to bring revolving balances below 30% of total limit, or request a credit limit increase without taking new debt."
        })
    elif credit_utilization > 30.0:
        bottlenecks.append({
            "code": "MODERATE_UTILIZATION",
            "title": f"Moderate Credit Utilization ({credit_utilization:.1f}%)",
            "severity": "info",
            "impact": "Mild Opportunity for Optimization",
            "description": "Indian financial advisors recommend maintaining total credit card usage under 30% for top-tier scores.",
            "recommendation": "Making mid-cycle bill payments before the statement generation date helps lower reported utilization."
        })

    # 3. High DTI bottleneck
    if dti_ratio > 50.0:
        bottlenecks.append({
            "code": "HIGH_DTI",
            "title": f"High Debt-to-Income Ratio ({dti_ratio:.1f}%)",
            "severity": "critical",
            "impact": "High Loan Approval Barrier",
            "description": "More than half of your gross monthly income is committed to servicing existing EMIs and loans.",
            "recommendation": "Avoid applying for new loans until existing high-interest personal or consumer loans are paid off."
        })
    elif dti_ratio > 35.0:
        bottlenecks.append({
            "code": "MODERATE_DTI",
            "title": f"Moderate Debt-to-Income Ratio ({dti_ratio:.1f}%)",
            "severity": "warning",
            "impact": "Moderate Loan Approval Impact",
            "description": "Lenders in India prefer DTI to stay comfortably below 35-40% for smooth unsecured lending.",
            "recommendation": "Focus on debt prepayment (snowball or avalanche method) to free up disposable income."
        })

    # 4. Low Credit Score bottleneck
    if credit_score < 650:
        bottlenecks.append({
            "code": "LOW_CREDIT_SCORE",
            "title": f"Score in Needs-Attention Band ({credit_score})",
            "severity": "warning",
            "impact": "Limited Access to Best Interest Rates",
            "description": "Scores below 650 generally require rebuilding positive payment history over 6 to 12 consecutive months.",
            "recommendation": "Maintain flawless on-time EMI repayments and keep credit card balances minimal."
        })

    return bottlenecks


def calculate_metric_deltas(current_data: Dict[str, Any], baseline_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates change between baseline (earliest or previous) and current snapshot.
    Ensures language reflects user-reported changes rather than AI causation.
    """
    if not baseline_data:
        return {
            "has_baseline": False,
            "score_change": 0,
            "utilization_change": 0.0,
            "dti_change": 0.0,
            "debt_change": 0.0,
            "missed_payments_change": 0,
            "wording": "Initial assessment record."
        }

    score_delta = current_data.get("credit_score", 0) - baseline_data.get("credit_score", 0)
    utilization_delta = round(
        current_data.get("credit_utilization", 0.0) - baseline_data.get("credit_utilization", 0.0), 2
    )
    dti_delta = round(
        current_data.get("dti_ratio", 0.0) - baseline_data.get("dti_ratio", 0.0), 2
    )
    debt_delta = round(
        current_data.get("total_debt", 0.0) - baseline_data.get("total_debt", 0.0), 2
    )
    missed_delta = (
        current_data.get("missed_payments", 0) - baseline_data.get("missed_payments", 0)
    )

    return {
        "has_baseline": True,
        "score_change": score_delta,
        "utilization_change": utilization_delta,
        "dti_change": dti_delta,
        "debt_change": debt_delta,
        "missed_payments_change": missed_delta,
        "wording": f"Change since baseline record: {score_delta:+d} points"
    }
