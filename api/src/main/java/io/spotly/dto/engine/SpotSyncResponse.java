package io.spotly.dto.engine;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpotSyncResponse {

    @JsonProperty("spot_id")
    private String spotId;

    private String status;

    @JsonProperty("rtree_node_count")
    private Integer rtreeNodeCount;
}

