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
@Document(collection = "courseModules")
public class CourseModule {
    @Id
    private String id;
    private String courseId;
    private String title;
    private String type; // pdf, video, quiz, etc.
    private String contentUrl;
    private Integer durationMinutes;
    private Integer orderIndex;
    private Date createdAt;
}
