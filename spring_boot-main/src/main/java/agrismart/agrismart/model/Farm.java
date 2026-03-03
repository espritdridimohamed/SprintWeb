package agrismart.agrismart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "farms")
public class Farm {
    @Id
    private String id;
    private String ownerUserId;
    private String name;
    private String locationText;
    private Double latitude;
    private Double longitude;
    private Double totalAreaHa;
    private String soilType;
    private String climateZone;
    private String waterSource;
    private Date createdAt;
    private Date updatedAt;
}
