
#include "crow.h"
#include "SpotStore.hpp"

#include <charconv>
#include <cmath>
#include <cstdlib>
#include <optional>
#include <string>
#include <utility>
#include <vector>

namespace {

std::optional<double> finiteNumber(const crow::json::rvalue& number) {
    const auto raw = static_cast<std::string>(number);
    char* end = nullptr;
    const double value = std::strtod(raw.c_str(), &end);
    if (end == raw.c_str() || end != raw.c_str() + raw.size() || !std::isfinite(value)) {
        return std::nullopt;
    }
    return value;
}

crow::response syncResponse(const std::string& spotId, spotly::SpotStore::SyncResult sync) {
    crow::json::wvalue result;
    result["spot_id"] = spotId;
    result["status"] = sync.applied ? "synced" : "stale";
    result["rtree_node_count"] = sync.indexSize;
    return crow::response(std::move(result));
}

}  // namespace

int main() {
    crow::SimpleApp app;
    spotly::SpotStore spotStore;

    // Health check
    CROW_ROUTE(app, "/health")([] {
        crow::json::wvalue response;
        response["status"] = "ok";
        response["service"] = "spotly-search-engine";
        return response;
    });

    // Synchronization of parking spots from Spring Boot
    CROW_ROUTE(app, "/api/v1/engine/spots/sync")
        .methods(crow::HTTPMethod::POST)(
            [&spotStore](const crow::request& req) {
                auto body = crow::json::load(req.body);

                if (!body || body.t() != crow::json::type::Object) {
                    return crow::response(400, "Invalid JSON");
                }

                if (!body.has("spot_id") ||
                    body["spot_id"].t() != crow::json::type::String) {
                    return crow::response(400, "Missing or invalid spot_id");
                }

                const std::string spotId = body["spot_id"].s();

                if (spotId.empty()) {
                    return crow::response(400, "Empty spot_id");
                }

                if (!body.has("is_active") ||
                    (body["is_active"].t() !=
                         crow::json::type::True &&
                     body["is_active"].t() !=
                         crow::json::type::False)) {
                    return crow::response(
                        400, "Missing or invalid is_active");
                }

                std::int64_t revision = 0;
                if (body.has("revision")) {
                    if (body["revision"].t() != crow::json::type::Number) {
                        return crow::response(400, "Invalid revision");
                    }
                    const auto value = static_cast<std::string>(body["revision"]);
                    const auto end = value.data() + value.size();
                    const auto parsed = std::from_chars(value.data(), end, revision);
                    if (parsed.ec != std::errc{} || parsed.ptr != end || revision < 0) {
                        return crow::response(400, "Invalid revision");
                    }
                }

                if (!body["is_active"].b()) {
                    return syncResponse(spotId, spotStore.upsert(
                        spotly::Spot{spotId, 0, 0, 0, {}, std::nullopt, false, false, revision}));
                }

                if (!body.has("latitude") ||
                    !body.has("longitude") ||
                    !body.has("hourly_rate")) {
                    return crow::response(
                        400, "Missing coordinates or hourly_rate");
                }

                if (body["latitude"].t() != crow::json::type::Number ||
                    body["longitude"].t() != crow::json::type::Number ||
                    body["hourly_rate"].t() != crow::json::type::Number) {
                    return crow::response(
                        400, "Invalid coordinates or hourly_rate");
                }

                if (!body.has("max_vehicle_size") ||
                    body["max_vehicle_size"].t() !=
                        crow::json::type::String) {
                    return crow::response(
                        400, "Missing or invalid max_vehicle_size");
                }

                if (!body.has("has_ev_charging") ||
                    (body["has_ev_charging"].t() !=
                         crow::json::type::True &&
                     body["has_ev_charging"].t() !=
                         crow::json::type::False)) {
                    return crow::response(
                        400, "Missing or invalid has_ev_charging");
                }

                if (body.has("max_height_meters") &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Null &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Number) {
                    return crow::response(
                        400, "Invalid max_height_meters");
                }

                const auto latitude = finiteNumber(body["latitude"]);
                const auto longitude = finiteNumber(body["longitude"]);
                const auto hourlyRate = finiteNumber(body["hourly_rate"]);

                if (!latitude || *latitude < -90.0 || *latitude > 90.0 ||
                    !longitude || *longitude < -180.0 || *longitude > 180.0 ||
                    !hourlyRate || *hourlyRate < 0.0) {
                    return crow::response(
                        400, "Invalid coordinates or hourly_rate values");
                }

                const std::string maxVehicleSize =
                    body["max_vehicle_size"].s();

                const bool hasEvCharging =
                    body["has_ev_charging"].b();

                std::optional<double> maxHeightMeters = std::nullopt;

                if (body.has("max_height_meters") &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Null) {
                    maxHeightMeters = finiteNumber(body["max_height_meters"]);

                    if (!maxHeightMeters ||
                        *maxHeightMeters < 0.0) {
                        return crow::response(
                            400, "Invalid max_height_meters value");
                    }
                }

                spotly::Spot spot{
                    spotId,
                    *latitude,
                    *longitude,
                    *hourlyRate,
                    maxVehicleSize,
                    maxHeightMeters,
                    hasEvCharging,
                    true,
                    revision
                };

                return syncResponse(spotId, spotStore.upsert(spot));
            });

    // Search for active parking spots
    CROW_ROUTE(app, "/api/v1/engine/spots/search")
        .methods(crow::HTTPMethod::GET)([&spotStore]() {
            const auto spots = spotStore.findActiveSpots();

            crow::json::wvalue response;
            response["count"] = static_cast<int>(spots.size());

            std::vector<crow::json::wvalue> results;

            for (const auto& spot : spots) {
                crow::json::wvalue item;

                item["spot_id"] = spot.spotId;
                item["latitude"] = spot.latitude;
                item["longitude"] = spot.longitude;
                item["hourly_rate"] = spot.hourlyRate;

                results.push_back(std::move(item));
            }

            response["spots"] = std::move(results);

            return response;
        });

    // Start server after registering all routes
    app.port(8080).multithreaded().run();

    return 0;
}
