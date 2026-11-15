#pragma once

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
};

}  // namespace spotly
