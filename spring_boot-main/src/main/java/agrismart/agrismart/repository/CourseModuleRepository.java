package agrismart.agrismart.repository;

import agrismart.agrismart.model.CourseModule;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CourseModuleRepository extends MongoRepository<CourseModule, String> {
    List<CourseModule> findByCourseId(String courseId);
}
