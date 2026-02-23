package agrismart.agrismart.dto;

import agrismart.agrismart.model.User;
import java.util.Date;

public record UserResponse(
    String id,
    String email,
    String firstName,
    String lastName,
    String roleId,
    String organization,
    String accountType,
    String profilePictureUrl,
    String status,
    Boolean isClientApproved,
    Date createdAt,
    Date updatedAt
) {
    public static UserResponse fromUser(User user) {
        return new UserResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoleId(),
            user.getOrganization(),
            user.getAccountType(),
            user.getProfilePictureUrl(),
            user.getStatus(),
            user.getIsClientApproved(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }
}
