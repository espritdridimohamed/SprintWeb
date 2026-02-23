package agrismart.agrismart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.Date;

@Document(collection = "roles")
@AllArgsConstructor
@NoArgsConstructor
public class Role {
    @Id
    private String id;
    private String name;
    private String description;
    private Date createdAt;

    public Role(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
