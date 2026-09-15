"""NEERNETRA — mock environmental/context layers (backend)."""

FISHING_ZONES = [
    {"id": "fz-versova", "name": "Versova Traditional Fishing Grounds", "activityLevel": "HIGH",
     "ring": [[72.760, 19.150], [72.800, 19.155], [72.810, 19.190], [72.775, 19.205], [72.745, 19.190], [72.750, 19.160], [72.760, 19.150]]},
    {"id": "fz-thal", "name": "Thal Coastal Fishery Zone", "activityLevel": "MODERATE",
     "ring": [[72.680, 18.960], [72.715, 18.965], [72.720, 18.995], [72.690, 19.005], [72.665, 18.990], [72.670, 18.965], [72.680, 18.960]]},
    {"id": "fz-fujairah", "name": "Fujairah Coastal Fishery Zone", "activityLevel": "MODERATE",
     "ring": [[63.150, 20.600], [63.190, 20.605], [63.195, 20.635], [63.160, 20.645], [63.130, 20.628], [63.135, 20.605], [63.150, 20.600]]},
    {"id": "fz-kochi", "name": "Kochi Offshore Fishery Zone", "activityLevel": "LOW",
     "ring": [[75.870, 9.700], [75.910, 9.705], [75.915, 9.740], [75.880, 9.750], [75.855, 9.730], [75.860, 9.708], [75.870, 9.700]]},
]

MPAS = [
    {"id": "mpa-malvan", "name": "Malvan Marine Sanctuary", "designation": "State Marine Sanctuary",
     "ring": [[73.440, 16.020], [73.480, 16.025], [73.485, 16.060], [73.450, 16.070], [73.420, 16.050], [73.425, 16.030], [73.440, 16.020]]},
    {"id": "mpa-kutch", "name": "Gulf of Kutch Marine National Park", "designation": "National Marine Park",
     "ring": [[69.550, 22.450], [69.620, 22.460], [69.630, 22.510], [69.570, 22.520], [69.520, 22.495], [69.530, 22.460], [69.550, 22.450]]},
]

SATELLITE_FOOTPRINTS = [
    {"id": "sf-1", "satellite": "Sentinel-1", "acquisitionUtc": "2026-09-13T08:02:18Z",
     "centroid": {"latitude": 19.09, "longitude": 72.73},
     "ring": [[72.55, 18.90], [72.95, 18.90], [72.95, 19.28], [72.55, 19.28], [72.55, 18.90]]},
    {"id": "sf-2", "satellite": "Sentinel-1", "acquisitionUtc": "2026-09-12T22:36:41Z",
     "centroid": {"latitude": 20.65, "longitude": 63.23},
     "ring": [[63.05, 20.47], [63.41, 20.47], [63.41, 20.83], [63.05, 20.83], [63.05, 20.47]]},
]

OCEAN_SAMPLES = [
    {"latitude": 19.00, "longitude": 72.70, "currentSpeedKn": 2.0, "currentDirectionDeg": 82, "seaSurfaceTempC": 22.2, "observedUtc": "2026-09-13T08:00:00Z"},
    {"latitude": 19.05, "longitude": 72.75, "currentSpeedKn": 2.2, "currentDirectionDeg": 85, "seaSurfaceTempC": 22.4, "observedUtc": "2026-09-13T08:00:00Z"},
]

WEATHER_SAMPLES = [
    {"latitude": 19.00, "longitude": 72.70, "windSpeedKt": 13.6, "windDirectionDeg": 44, "observedUtc": "2026-09-13T08:00:00Z"},
    {"latitude": 19.05, "longitude": 72.75, "windSpeedKt": 14.0, "windDirectionDeg": 45, "observedUtc": "2026-09-13T08:00:00Z"},
]
