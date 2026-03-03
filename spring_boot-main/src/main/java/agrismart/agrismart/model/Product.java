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
@Document(collection = "products")
public class Product {
    @Id
    private String id;
    private String sellerUserId;
    private String farmId;
    private String name;
    private String category;
    private String description;
    private String unit;
    private Double unitPrice;
    private Double stockQty;
    private String status;
    private Date createdAt;
    private Date updatedAt;
}
