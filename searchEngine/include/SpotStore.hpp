
#pragma once

#include "Spot.hpp"

#include <mutex>
#include <optional>
#include <string>
#include <unordered_map>

namespace spotly {

class SpotStore {
public:
    void upsert(const Spot& spot) {
        std::lock_guard<std::mutex> lock(mutex_);
        spots_[spot.spotId] = spot;
    }

    std::optional<Spot> findById(const std::string& spotId) const {
        std::lock_guard<std::mutex> lock(mutex_);

        auto it = spots_.find(spotId);
        if (it == spots_.end()) {
            return std::nullopt;
        }

        return it->second;
    }

    std::size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return spots_.size();
    }

private:
    mutable std::mutex mutex_;
    std::unordered_map<std::string, Spot> spots_;
};

}  // namespace spotly
