"""NEERNETRA — mock AIS trajectory dataset (backend). Mirrors frontend/src/data/aisTrajectories.ts."""

AIS_TRAJECTORIES = [
    {
        "vesselId": "v-ocean-star", "vesselName": "MV OCEAN STAR",
        "points": [
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T00:00:00Z", "latitude": 19.2205, "longitude": 73.0402, "speedKn": 13.6, "courseDeg": 251, "headingDeg": 251},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T01:00:00Z", "latitude": 19.1602, "longitude": 72.9601, "speedKn": 13.8, "courseDeg": 251, "headingDeg": 251},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T02:00:00Z", "latitude": 19.1101, "longitude": 72.8955, "speedKn": 13.8, "courseDeg": 251, "headingDeg": 251},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T02:10:00Z", "latitude": 19.1032, "longitude": 72.8865, "speedKn": 6.2, "courseDeg": 238, "headingDeg": 238},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T04:55:00Z", "latitude": 19.0781, "longitude": 72.8391, "speedKn": 6.9, "courseDeg": 238, "headingDeg": 238},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T05:02:00Z", "latitude": 19.0764, "longitude": 72.8362, "speedKn": 13.1, "courseDeg": 245, "headingDeg": 245},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T06:00:00Z", "latitude": 19.0705, "longitude": 72.8154, "speedKn": 12.9, "courseDeg": 245, "headingDeg": 246},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T09:00:00Z", "latitude": 19.0611, "longitude": 72.7902, "speedKn": 12.6, "courseDeg": 245, "headingDeg": 246},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T12:00:00Z", "latitude": 19.0559, "longitude": 72.7742, "speedKn": 12.5, "courseDeg": 245, "headingDeg": 247},
            {"vesselId": "v-ocean-star", "timestampUtc": "2026-09-13T14:30:00Z", "latitude": 19.0512, "longitude": 72.7601, "speedKn": 12.4, "courseDeg": 245, "headingDeg": 247},
        ],
    },
    {
        "vesselId": "v-pacific-voyager", "vesselName": "PACIFIC VOYAGER",
        "points": [
            {"vesselId": "v-pacific-voyager", "timestampUtc": "2026-09-13T08:00:00Z", "latitude": 19.3402, "longitude": 73.1301, "speedKn": 13.6, "courseDeg": 245, "headingDeg": 245},
            {"vesselId": "v-pacific-voyager", "timestampUtc": "2026-09-13T11:00:00Z", "latitude": 19.2205, "longitude": 72.9421, "speedKn": 14.0, "courseDeg": 245, "headingDeg": 244},
            {"vesselId": "v-pacific-voyager", "timestampUtc": "2026-09-13T14:28:00Z", "latitude": 19.1622, "longitude": 72.8410, "speedKn": 14.2, "courseDeg": 245, "headingDeg": 244},
        ],
    },
    {
        "vesselId": "v-horizon-9", "vesselName": "HORIZON 9",
        "points": [
            {"vesselId": "v-horizon-9", "timestampUtc": "2026-09-13T10:00:00Z", "latitude": 19.1401, "longitude": 72.7702, "speedKn": 9.4, "courseDeg": 198, "headingDeg": 198},
            {"vesselId": "v-horizon-9", "timestampUtc": "2026-09-13T14:31:00Z", "latitude": 18.9781, "longitude": 72.6203, "speedKn": 9.7, "courseDeg": 198, "headingDeg": 199},
        ],
    },
    {
        "vesselId": "v-crimson-tide", "vesselName": "CRIMSON TIDE",
        "points": [
            {"vesselId": "v-crimson-tide", "timestampUtc": "2026-09-13T08:00:00Z", "latitude": 20.8801, "longitude": 63.6602, "speedKn": 11.4, "courseDeg": 287, "headingDeg": 287},
            {"vesselId": "v-crimson-tide", "timestampUtc": "2026-09-13T13:55:00Z", "latitude": 20.6103, "longitude": 63.1187, "speedKn": 11.1, "courseDeg": 301, "headingDeg": 300},
        ],
    },
]


def get_trajectory(vessel_id: str):
    return next((t for t in AIS_TRAJECTORIES if t["vesselId"] == vessel_id), None)
