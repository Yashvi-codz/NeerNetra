"""
NEERNETRA — vessel provider factory.

Chooses mock vs VesselFinder based on VESSEL_DATA_PROVIDER, and always
falls back to mock data if VesselFinder is selected but unavailable
(missing key, network failure, malformed response). Never crashes the
application and never reports LIVE status when serving mock data.
"""
from services.config import VESSEL_DATA_PROVIDER
from services.mock_vessel_service import MockVesselService
from services.vesselfinder_service import VesselFinderService, VesselFinderUnavailable

_mock = MockVesselService()


def get_vessel_service():
    """Returns (service, status_label) where status_label is 'LIVE' or 'DEMO'."""
    if VESSEL_DATA_PROVIDER == "vesselfinder":
        try:
            return VesselFinderService(), "LIVE"
        except VesselFinderUnavailable:
            return _mock, "DEMO"
    return _mock, "DEMO"
