package agrismart.agrismart.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.Date;

@Document(collection = "offers")
@AllArgsConstructor
@NoArgsConstructor
public class Offer {
    @Id
    private String id;
    private String product;
    private Integer quantity;
    private String unit;
    private Double price;
    private String quality;
    private String availability;
    private String status; // pending, validated, sold
    private String ownerEmail;
    private Date date;

    public Offer(String product, Integer quantity, String unit, Double price, String quality, String availability,
            String ownerEmail) {
        this.product = product;
        this.quantity = quantity;
        this.unit = unit;
        this.price = price;
        this.quality = quality;
        this.availability = availability;
        this.ownerEmail = ownerEmail;
        this.status = "pending";
        this.date = new Date();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProduct() {
        return product;
    }

    public void setProduct(String product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
