#include "crow.h"

int main() {
    crow::SimpleApp app;

    CROW_ROUTE(app, "/health")([] {
        crow::json::wvalue response;

        response["status"] = "ok";
        response["service"] = "spotly-search-engine";

        return response;
    });

    app.port(8081).multithreaded().run();

    return 0;
}
