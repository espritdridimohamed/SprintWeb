package agrismart.agrismart.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileController {

    private final String uploadDir = "uploads";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                Files.createDirectories(root);
            }

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), root.resolve(fileName));

            // In production, this should be configurable or use a relative path
            String fileUrl = "http://localhost:8080/uploads/" + fileName;

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("fileName", file.getOriginalFilename());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/files")
    public ResponseEntity<List<Map<String, String>>> listFiles() {
        try {
            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Map<String, String>> files = Files.list(root)
                .map(path -> {
                    Map<String, String> fileInfo = new HashMap<>();
                    String fileName = path.getFileName().toString();
                    fileInfo.put("name", fileName);
                    fileInfo.put("url", "http://localhost:8080/uploads/" + fileName);
                    return fileInfo;
                })
                .collect(Collectors.toList());

            return ResponseEntity.ok(files);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
