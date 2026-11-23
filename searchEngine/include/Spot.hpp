#pragma once

#include <cstdint>
#include <optional>
#include <string>

namespace spotly {

struct Spot {
    std::string spotId;
    double latitude;
    double longitude;
    double hourlyRate;
    std::string maxVehicleSize;
    std::optional<double> maxHeightMeters;
    bool hasEvCharging;
    bool isActive;
    std::int64_t revision = 0;
};

}  // namespace spotly
