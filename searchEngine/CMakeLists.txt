
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
    src/Ranking.cpp
)

target_include_directories(spotly_search_engine
    PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_link_libraries(spotly_search_engine
    PRIVATE Crow::Crow
)


# Unit testing with GoogleTest
option(SPOTLY_BUILD_TESTS "Build unit tests" ON)

if(SPOTLY_BUILD_TESTS)
    enable_testing()

    FetchContent_Declare(
        googletest
        GIT_REPOSITORY https://github.com/google/googletest.git
        GIT_TAG v1.16.0
    )

    FetchContent_MakeAvailable(googletest)


add_executable(spotly_tests
    tests/SearchEngineTest.cpp
    src/Ranking.cpp
)

target_include_directories(spotly_tests
    PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include
)


    target_link_libraries(spotly_tests
        PRIVATE GTest::gtest_main
    )

    include(GoogleTest)
    gtest_discover_tests(spotly_tests)
endif()
