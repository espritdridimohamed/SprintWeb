package agrismart.agrismart.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {
    private String id;
    private String title;
    private String content; // Rich text / HTML
    private String type; // "video", "pdf", "text", "youtube", "word"
    private String duration;
    private String fileUrl;
    private String youtubeUrl;
    private Boolean completed;
}
