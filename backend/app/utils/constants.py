"""
Financial constants and educational threshold definitions for the Indian Credit Ecosystem.
Note: In India, credit bureaus (such as CIBIL, Experian, Equifax, CRIF High Mark) score individuals
on a 300 to 900 scale.
These thresholds are provided solely as educational indicators, not official regulatory guarantees.
"""

# Credit Score Range in India (CIBIL / Experian scale)
MIN_CREDIT_SCORE = 300
MAX_CREDIT_SCORE = 900

# Educational Credit Score Tiers
SCORE_TIER_EXCELLENT_MIN = 750
SCORE_TIER_GOOD_MIN = 700
SCORE_TIER_FAIR_MIN = 650

def get_credit_score_status(score: int) -> dict:
    """
    Returns educational status and description for a given score.
    """
    if score >= SCORE_TIER_EXCELLENT_MIN:
        return {
            "status": "Excellent",
            "tier": "excellent",
            "description": "High likelihood of loan and card approval with competitive interest rates in India.",
            "color": "#10B981"  # Emerald green
        }
    elif score >= SCORE_TIER_GOOD_MIN:
        return {
            "status": "Good",
            "tier": "good",
            "description": "Favorable credit profile. Most Indian lenders look favorably upon scores above 700.",
            "color": "#3B82F6"  # Blue
        }
    elif score >= SCORE_TIER_FAIR_MIN:
        return {
            "status": "Fair",
            "tier": "fair",
            "description": "Acceptable, but some lenders may apply stricter terms or higher interest rates.",
            "color": "#F59E0B"  # Amber
        }
    else:
        return {
            "status": "Needs Attention",
            "tier": "poor",
            "description": "Low credit score. May face difficulty obtaining unsecured credit or high interest rates.",
            "color": "#EF4444"  # Red
        }

# Debt-to-Income (DTI) Educational Benchmarks
# In the Indian banking context, banks generally prefer EMI to Net Monthly Income below 40-50%
DTI_HEALTHY_MAX = 35.0
DTI_MODERATE_MAX = 50.0

def get_dti_status(dti: float) -> dict:
    if dti <= DTI_HEALTHY_MAX:
        return {
            "status": "Healthy",
            "tier": "healthy",
            "description": "Debt obligations are well-balanced with income. Lenders view this as comfortable repayment capacity.",
            "color": "#10B981"
        }
    elif dti <= DTI_MODERATE_MAX:
        return {
            "status": "Moderate",
            "tier": "moderate",
            "description": "A noticeable portion of income goes towards EMIs. Be cautious when taking on additional debt.",
            "color": "#F59E0B"
        }
    else:
        return {
            "status": "High Risk",
            "tier": "high",
            "description": "Over half of monthly income is committed to debt repayments. High risk of financial stress.",
            "color": "#EF4444"
        }

# Credit Utilization Educational Benchmarks
# Financial advisors and bureaus recommend keeping revolving card utilization under 30%
UTILIZATION_OPTIMAL_MAX = 30.0
UTILIZATION_MODERATE_MAX = 50.0

def get_utilization_status(utilization: float) -> dict:
    if utilization <= UTILIZATION_OPTIMAL_MAX:
        return {
            "status": "Optimal",
            "tier": "optimal",
            "description": "Recommended utilization (<= 30%). Signals disciplined credit card usage to Indian bureaus.",
            "color": "#10B981"
        }
    elif utilization <= UTILIZATION_MODERATE_MAX:
        return {
            "status": "Moderate",
            "tier": "moderate",
            "description": "Moderate utilization. While acceptable, keeping it under 30% can help optimize your profile.",
            "color": "#F59E0B"
        }
    else:
        return {
            "status": "High",
            "tier": "high",
            "description": "High credit card usage (> 50%). Bureaus and lenders may view this as credit dependency.",
            "color": "#EF4444"
        }

# Mandatory Legal & Educational Disclaimer
MANDATORY_DISCLAIMER = (
    "Credit Assistant provides educational information based on the data you provide. "
    "It does not provide financial, legal, or credit-bureau advice and does not guarantee "
    "changes to your credit score. Verify important information with your lender or authorized credit bureau."
)
