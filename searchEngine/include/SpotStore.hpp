#pragma once

#include "Spot.hpp"

#include <boost/geometry.hpp>
#include <boost/geometry/index/rtree.hpp>

#include <mutex>
#include <optional>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

namespace spotly {

namespace bg = boost::geometry;
namespace bgi = boost::geometry::index;

class SpotStore {
public:
    struct SyncResult {
        bool applied;
        std::size_t indexSize;
    };

    SyncResult upsert(const Spot& spot) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto existing = spots_.find(spot.spotId);
        if (existing != spots_.end()) {
            if (spot.revision < existing->second.revision) {
                return {false, index_.size()};
            }
            if (spot.revision > 0 && spot.revision == existing->second.revision) {
                return {true, index_.size()};
            }
            if (existing->second.isActive) {
                index_.remove(indexValue(existing->second));
            }
        }

        // Keep the inactive revision to reject delayed updates that would restore the spot.
        spots_.insert_or_assign(spot.spotId, spot);
        if (spot.isActive) {
            index_.insert(indexValue(spot));
        }
        return {true, index_.size()};
    }

    std::optional<Spot> findById(const std::string& spotId) const {
        std::lock_guard<std::mutex> lock(mutex_);
        const auto it = spots_.find(spotId);
        if (it == spots_.end()) {
            return std::nullopt;
        }
        return it->second;
    }

    std::size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return spots_.size();
    }

    std::vector<Spot> findActiveSpots() const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Spot> results;
        results.reserve(index_.size());
        for (const auto& entry : index_) {
            results.push_back(spots_.at(entry.second));
        }
        return results;
    }

private:
    using Point = bg::model::point<double, 2, bg::cs::cartesian>;
    using IndexValue = std::pair<Point, std::string>;

    static IndexValue indexValue(const Spot& spot) {
        return {Point{spot.longitude, spot.latitude}, spot.spotId};
    }

    mutable std::mutex mutex_;
    std::unordered_map<std::string, Spot> spots_;
    bgi::rtree<IndexValue, bgi::quadratic<16>> index_;
};

}  // namespace spotly
