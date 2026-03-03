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
@Document(collection = "supportTickets")
public class SupportTicket {
    @Id
    private String id;
    private String createdByUserId;
    private String category;
    private String subject;
    private String description;
    private String priority;
    private String status;
    private String assignedToUserId;
    private Date createdAt;
    private Date closedAt;
}
