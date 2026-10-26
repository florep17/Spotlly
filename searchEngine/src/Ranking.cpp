
#include "Ranking.hpp"

#include <algorithm>
#include <vector>

namespace spotly {

double calculateScore(const ParkingSpot& spot) {
    // Lower price and shorter distance increase the score.
    double score = 100.0;

    score -= spot.distanceKm * 15.0;
    score -= spot.pricePerHour * 3.0;

    // Additional amenities improve the ranking.
    if (spot.covered) {
        score += 10.0;
    }

    if (spot.secured) {
        score += 10.0;
    }

    return score;
}

std::vector<RankedSpot> rankParkingSpots(const std::vector<ParkingSpot>& spots) {
    std::vector<RankedSpot> rankedSpots;
    rankedSpots.reserve(spots.size());

    for (const auto& spot : spots) {
        rankedSpots.push_back({spot, calculateScore(spot)});
    }

    std::sort(rankedSpots.begin(), rankedSpots.end(),
              [](const RankedSpot& a, const RankedSpot& b) { return a.score > b.score; });

    return rankedSpots;
}

}  // namespace spotly
