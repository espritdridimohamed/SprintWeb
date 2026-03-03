package agrismart.agrismart.repository;

import agrismart.agrismart.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
    List<SupportTicket> findByCreatedByUserId(String userId);
    List<SupportTicket> findByStatus(String status);
}
