"""
NEERNETRA — probable cause analysis.

analyze_cause(...) combines vessel counterfactual results, detection
confidence, dark-contact corroboration, and environmental consistency into
a probable-cause classification. If evidence is insufficient, it MUST
return "Unknown / insufficient evidence" rather than forcing a cause.

Expected real contract:
    analyze_cause(incident, counterfactuals, dark_contacts) -> dict

Returns:
    {
        "cause": str,
        "confidence": float,
        "feature_contributions": [{"feature": str, "weight_pct": float, "note": str}, ...],
        "is_demo_output": bool,
    }
"""
from typing import Optional
from data.mock_analysis import get_cause_analysis


def analyze_cause(incident_id: str) -> Optional[dict]:
    """Phase 1/2 mock: replay the pre-computed cause analysis."""
    return get_cause_analysis(incident_id)
