#include <gtest/gtest.h>

#include <string>

#include "Ranking.hpp"
#include "SpotStore.hpp"

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

TEST(SpotStoreTest, MovesAndDeactivatesIndexedSpotsWithoutRestoringOlderRevisions) {
    spotly::SpotStore store;
    spotly::Spot spot{"spot", 50, 19, 10, "SUV", std::nullopt, false, true, 1};

    EXPECT_EQ(store.upsert(spot).indexSize, 1);
    EXPECT_EQ(store.upsert(spot).indexSize, 1);

    spot.longitude = 20;
    spot.revision = 2;
    EXPECT_EQ(store.upsert(spot).indexSize, 1);
    const auto updated = store.findActiveSpots();
    ASSERT_EQ(updated.size(), 1);
    EXPECT_DOUBLE_EQ(updated.front().longitude, 20);

    auto inactive = spot;
    inactive.isActive = false;
    inactive.revision = 3;
    EXPECT_EQ(store.upsert(inactive).indexSize, 0);
    EXPECT_EQ(store.upsert(inactive).indexSize, 0);
    EXPECT_FALSE(store.upsert(spot).applied);
    EXPECT_TRUE(store.findActiveSpots().empty());

    spot.revision = 4;
    EXPECT_EQ(store.upsert(spot).indexSize, 1);
}
