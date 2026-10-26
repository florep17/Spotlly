
#pragma once

#include <string>
#include <vector>

namespace spotly {

struct ParkingSpot {
    int id;
    double distanceKm;
    double pricePerHour;
    bool covered;
    bool secured;
};

struct RankedSpot {
    ParkingSpot spot;
    double score;
};

double calculateScore(const ParkingSpot& spot);

std::vector<RankedSpot> rankParkingSpots(const std::vector<ParkingSpot>& spots);

}  // namespace spotly
