"""
NEERNETRA — counterfactual vessel-movement analysis.

run_counterfactual(...) answers: "Could this vessel's movement physically
explain the observed spill?" It is explicitly NOT a determination of
responsibility — see docs/ARCHITECTURE.md §Investigative Language.

Expected real contract:
    run_counterfactual(vessel_trajectory, hindcast_result, environment) -> dict

Returns spatial/temporal/trajectory/environmental consistency ratings,
an overall verdict, confidence, and human-readable reasoning.
"""
from typing import Optional
from data.mock_analysis import get_counterfactual


def run_counterfactual(vessel_id: str, incident_id: str) -> Optional[dict]:
    """Phase 1/2 mock: replay the pre-computed counterfactual result."""
    return get_counterfactual(vessel_id, incident_id)
