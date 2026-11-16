
#include "crow.h"
#include "SpotStore.hpp"

#include <cmath>
#include <optional>
#include <string>
#include <utility>
#include <vector>

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

                if (!body.has("is_active") ||
                    (body["is_active"].t() !=
                         crow::json::type::True &&
                     body["is_active"].t() !=
                         crow::json::type::False)) {
                    return crow::response(
                        400, "Missing or invalid is_active");
                }

                if (body.has("max_height_meters") &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Null &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Number) {
                    return crow::response(
                        400, "Invalid max_height_meters");
                }

                const double latitude = body["latitude"].d();
                const double longitude = body["longitude"].d();
                const double hourlyRate = body["hourly_rate"].d();

                if (!std::isfinite(latitude) ||
                    latitude < -90.0 || latitude > 90.0 ||
                    !std::isfinite(longitude) ||
                    longitude < -180.0 || longitude > 180.0 ||
                    !std::isfinite(hourlyRate) ||
                    hourlyRate < 0.0) {
                    return crow::response(
                        400, "Invalid coordinates or hourly_rate values");
                }

                const std::string maxVehicleSize =
                    body["max_vehicle_size"].s();

                const bool hasEvCharging =
                    body["has_ev_charging"].b();

                const bool isActive =
                    body["is_active"].b();

                std::optional<double> maxHeightMeters = std::nullopt;

                if (body.has("max_height_meters") &&
                    body["max_height_meters"].t() !=
                        crow::json::type::Null) {
                    maxHeightMeters =
                        body["max_height_meters"].d();

                    if (!std::isfinite(*maxHeightMeters) ||
                        *maxHeightMeters < 0.0) {
                        return crow::response(
                            400, "Invalid max_height_meters value");
                    }
                }

                spotly::Spot spot{
                    spotId,
                    latitude,
                    longitude,
                    hourlyRate,
                    maxVehicleSize,
                    maxHeightMeters,
                    hasEvCharging,
                    isActive
                };

                spotStore.upsert(spot);

                crow::json::wvalue result;
                result["spot_id"] = spotId;
                result["status"] = "synced";

                crow::response response(200);
                response.set_header(
                    "Content-Type", "application/json");
                response.body = result.dump();

                return response;
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