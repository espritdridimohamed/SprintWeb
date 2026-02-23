package agrismart.agrismart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.Date;

@Document(collection = "users")
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    private String id;
    private String email;
    
    @Field("passwordHash")
    private String passwordHash;
    
    private String firstName;
    private String lastName;
    
    @Field("roleId")
    private String roleId;
    
    private String organization;
    private String status;
    private String accountType;
    private Boolean isClientApproved;
    private String profilePictureUrl;
    private Date lastLoginAt;
    private Date createdAt;
    private Date updatedAt;

    public User(String email, String passwordHash, String firstName, String lastName, String roleId) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roleId = roleId;
        this.status = "ACTIVE";
        this.isClientApproved = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getRoleId() { return roleId; }
    public void setRoleId(String roleId) { this.roleId = roleId; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    
    public Boolean getIsClientApproved() { return isClientApproved; }
    public void setIsClientApproved(Boolean isClientApproved) { this.isClientApproved = isClientApproved; }
    
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    
    public Date getLastLoginAt() { return lastLoginAt; }
    public void setLastLoginAt(Date lastLoginAt) { this.lastLoginAt = lastLoginAt; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
