"""
NEERNETRA — mock vessel provider.

Always available, used whenever VESSEL_DATA_PROVIDER=mock (the Phase 1/2
default) or as an automatic fallback when the VesselFinder provider is
unavailable/unconfigured. Never raises.
"""
from typing import List, Optional
from data.mock_vessels import VESSELS, get_vessel
from data.mock_ais import AIS_TRAJECTORIES, get_trajectory


class MockVesselService:
    source_label = "DEMO"

    def list_vessels(self) -> List[dict]:
        return VESSELS

    def get_vessel(self, vessel_id: str) -> Optional[dict]:
        return get_vessel(vessel_id)

    def list_trajectories(self) -> List[dict]:
        return AIS_TRAJECTORIES

    def get_trajectory(self, vessel_id: str) -> Optional[dict]:
        return get_trajectory(vessel_id)
