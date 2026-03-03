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
@Document(collection = "plots")
public class Plot {
    @Id
    private String id;
    private String farmId;
    private String name;
    private Double sizeHa;
    private Double soilPh;
    private String irrigationType;
    private String status;
    private String currentCropId;
    private Date lastUpdatedAt;
}
