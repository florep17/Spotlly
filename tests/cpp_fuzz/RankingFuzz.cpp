
#include "Ranking.hpp"

#include <cstddef>
#include <cstdint>
#include <vector>

extern "C" int LLVMFuzzerTestOneInput(const uint8_t* data, size_t size) {
    if (size < 3) {
        return 0;
    }

    std::vector<spotly::ParkingSpot> spots;

    for (size_t i = 0; i + 2 < size && spots.size() < 100; i += 3) {
        spotly::ParkingSpot spot{
            static_cast<int>(spots.size()),
            static_cast<double>(data[i]),
            static_cast<double>(data[i + 1]),
            (data[i + 2] & 1) != 0,
            (data[i + 2] & 2) != 0
        };

        spots.push_back(spot);
    }

    const auto rankedSpots = spotly::rankParkingSpots(spots);

    if (rankedSpots.size() != spots.size()) {
        __builtin_trap();
    }

    for (size_t i = 1; i < rankedSpots.size(); ++i) {
        if (rankedSpots[i - 1].score < rankedSpots[i].score) {
            __builtin_trap();
        }
    }

    return 0;
}
