
#include <string>

#include <gtest/gtest.h>

TEST(SearchEngineTest, BasicArithmetic) {
    EXPECT_EQ(2 + 2, 4);
}

TEST(SearchEngineTest, StringComparison) {
    const std::string serviceName = "spotly-search-engine";

    EXPECT_EQ(serviceName, "spotly-search-engine");
}
