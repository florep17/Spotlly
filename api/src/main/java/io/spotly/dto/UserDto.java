package io.spotly.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.spotly.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @Schema(description = "User unique ID", example = "u-450e12-b1")
    private String id;

    @Schema(description = "User email address", example = "driver@example.com")
    private String email;

    @Schema(description = "User nickname", example = "SpotlyDriver")
    private String nickname;

    @JsonProperty("first_name")
    @Schema(description = "User first name or nickname", example = "SpotlyDriver")
    private String firstName;

    @Schema(description = "User role", example = "USER")
    private String role;

    public static UserDto fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .firstName(user.getFirstName() != null ? user.getFirstName() : user.getNickname())
                .role(user.getRole())
                .build();
    }
}

