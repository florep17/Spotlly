#include <gtest/gtest.h>

#include <string>

#include "Ranking.hpp"

TEST(SearchEngineTest, BasicArithmetic) { EXPECT_EQ(2 + 2, 4); }

TEST(SearchEngineTest, StringComparison) {
    const std::string serviceName = "spotly-search-engine";

    EXPECT_EQ(serviceName, "spotly-search-engine");
}

TEST(RankingTest, CalculatesScoreCorrectly) {
    spotly::ParkingSpot spot{
        1,     // id
        1.0,   // distanceKm
        5.0,   // pricePerHour
        true,  // covered
        true   // secured
    };

    double score = spotly::calculateScore(spot);

    EXPECT_DOUBLE_EQ(score, 90.0);
}

TEST(RankingTest, SortsParkingSpotsByScore) {
    std::vector<spotly::ParkingSpot> spots = {
        {1, 3.0, 10.0, false, false}, {2, 1.0, 5.0, true, true}, {3, 2.0, 7.0, false, true}};

    std::vector<spotly::RankedSpot> rankedSpots = spotly::rankParkingSpots(spots);

    ASSERT_EQ(rankedSpots.size(), 3);

    EXPECT_EQ(rankedSpots[0].spot.id, 2);
    EXPECT_EQ(rankedSpots[1].spot.id, 3);
    EXPECT_EQ(rankedSpots[2].spot.id, 1);
}

TEST(RankingTest, HandlesEmptyParkingSpotList) {
    std::vector<spotly::ParkingSpot> spots;

    std::vector<spotly::RankedSpot> rankedSpots = spotly::rankParkingSpots(spots);

    EXPECT_TRUE(rankedSpots.empty());
}
