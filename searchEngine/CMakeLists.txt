
cmake_minimum_required(VERSION 3.20)

project(SpotlySearchEngine LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

# Crow HTTP framework
set(CROW_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(CROW_BUILD_TESTS OFF CACHE BOOL "" FORCE)

FetchContent_Declare(
    Crow
    GIT_REPOSITORY https://github.com/CrowCpp/Crow.git
    GIT_TAG v1.3.4
)

FetchContent_MakeAvailable(Crow)

add_executable(spotly_search_engine
    src/main.cpp
)

target_link_libraries(spotly_search_engine
    PRIVATE Crow::Crow
)
