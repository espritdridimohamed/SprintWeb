package agrismart.agrismart.repository;

import agrismart.agrismart.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findBySellerUserId(String sellerUserId);
    List<Product> findByCategory(String category);
}
