package agrismart.agrismart.controller;

import agrismart.agrismart.model.AgriTask;
import agrismart.agrismart.repository.TaskRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * PlanningController — CRUD sécurisé par rôle
 *
 * Logique métier :
 * - PRODUCTEUR : crée et gère SES tâches
 * - COOPERATIVE : crée tâches + gère campagnes
 * - TECHNICIEN : peut UNIQUEMENT mettre à jour le statut (PUT
 * /tasks/{id}/status)
 * - ONG / ETAT : lecture campagnes + stats nationales
 * - ADMIN : accès complet, seul à supprimer
 * - VIEWER : lecture seule GET
 */
@RestController
@RequestMapping("/api/planning")
@CrossOrigin(origins = "http://localhost:4200")
public class PlanningController {

    @Autowired
    private TaskRepository taskRepository;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ TASKS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // GET /api/planning/tasks — tous authentifiés
    @GetMapping("/tasks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AgriTask>> getAllTasks() {
        return ResponseEntity.ok(taskRepository.findAll());
    }

    // POST /api/planning/tasks — PRODUCTEUR, COOPERATIVE, ADMIN
    @PostMapping("/tasks")
    @PreAuthorize("@planningController.canCreateTasks(authentication)")
    public ResponseEntity<AgriTask> createTask(
            @RequestBody AgriTask task,
            Authentication auth) {
        task.setOwnerEmail(auth.getName());
        task.setStatus("todo");
        task.setCreatedAt(new java.util.Date());
        if (task.getPlanId() == null) {
            task.setPlanId(new ObjectId());
        }
        if (task.getDueDate() == null) {
            task.setDueDate(task.getDate() != null ? task.getDate() : new java.util.Date());
        }
        if (task.getTaskType() == null || task.getTaskType().isBlank()) {
            task.setTaskType(task.getType());
        }
        if (task.getNotes() == null) {
            task.setNotes(task.getDescription());
        }
        return ResponseEntity.ok(taskRepository.save(task));
    }

    // PUT /api/planning/tasks/{id} — PRODUCTEUR(owner) ou COOPERATIVE ou ADMIN
    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('COOPERATIVE') or " +
            "(hasRole('PRODUCTEUR') and @planningController.isTaskOwner(#id, authentication.name))")
    public ResponseEntity<AgriTask> updateTask(
            @PathVariable String id,
            @RequestBody AgriTask body) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setTitle(body.getTitle());
                    task.setDescription(body.getDescription());
                    task.setType(body.getType());
                    task.setTaskType(body.getType());
                    task.setParcel(body.getParcel());
                    task.setPriority(body.getPriority());
                    task.setDate(body.getDate());
                    task.setDueDate(body.getDate());
                    task.setAssignedTo(body.getAssignedTo());
                    task.setNotes(body.getDescription());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/planning/tasks/{id}/status
     * TECHNICIEN peut UNIQUEMENT mettre à jour le statut des tâches assignées.
     * ADMIN peut mettre à jour n'importe quelle tâche.
     */
    @PutMapping("/tasks/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or " +
            "(hasRole('TECHNICIEN') and @planningController.isAssignedTo(#id, authentication.name))")
    public ResponseEntity<AgriTask> updateTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return taskRepository.findById(id)
                .map(task -> {
                    task.setStatus(newStatus);
                    if ("done".equalsIgnoreCase(newStatus) || "completed".equalsIgnoreCase(newStatus)) {
                        task.setCompletedAt(new Date());
                    }
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/planning/tasks/{id} — ADMIN seulement
    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ CAMPAIGNS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private List<Map<String, Object>> campaigns = new ArrayList<>(Arrays.asList(
            new HashMap<>(Map.of("id", "c1", "name", "Campagne Tomates 2024", "zone", "Nord", "status", "En cours",
                    "participants", 12)),
            new HashMap<>(Map.of("id", "c2", "name", "Récolte Blé Centre", "zone", "Centre", "status", "Planifiée",
                    "participants", 5))));

    // GET /api/planning/campaigns — tous authentifiés
    @GetMapping("/campaigns")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getCampaigns() {
        return ResponseEntity.ok(campaigns);
    }

    // POST /api/planning/campaigns — COOPERATIVE, ADMIN
    @PostMapping("/campaigns")
    @PreAuthorize("hasRole('COOPERATIVE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createCampaign(
            @RequestBody Map<String, Object> body) {
        Map<String, Object> campaign = new HashMap<>(body);
        campaign.put("id", UUID.randomUUID().toString());
        campaign.put("status", "Planifiée");
        campaign.put("participants", 0);
        campaigns.add(campaign);
        return ResponseEntity.ok(campaign);
    }

    // PUT /api/planning/campaigns/{id} — COOPERATIVE, ONG, ETAT, ADMIN
    @PutMapping("/campaigns/{id}")
    @PreAuthorize("hasRole('COOPERATIVE') or hasRole('ONG') or hasRole('ETAT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCampaign(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return campaigns.stream()
                .filter(c -> id.equals(c.get("id")))
                .findFirst()
                .map(campaign -> {
                    campaign.putAll(body);
                    campaign.put("id", id);
                    return ResponseEntity.ok(campaign);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ STATS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // GET /api/planning/stats — ETAT, ADMIN
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ETAT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTasks", taskRepository.count());
        stats.put("completedTasks",
                taskRepository.findAll().stream().filter(t -> "done".equals(t.getStatus())).count());
        stats.put("activeCampaigns", campaigns.stream().filter(c -> "En cours".equals(c.get("status"))).count());
        stats.put("totalParticipants", campaigns.stream().mapToInt(c -> (int) c.getOrDefault("participants", 0)).sum());
        return ResponseEntity.ok(stats);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ RESOURCES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    private List<Map<String, Object>> resources = new ArrayList<>(Arrays.asList(
            new HashMap<>(Map.of("id", "r1", "name", "Tracteur FENDT", "type", "Matériel", "status", "Disponible")),
            new HashMap<>(Map.of("id", "r2", "name", "Engrais NPK", "type", "Intrant", "status", "Stock faible"))));

    // GET /api/planning/resources — tous authentifiés
    @GetMapping("/resources")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getResources() {
        return ResponseEntity.ok(resources);
    }

    // PUT /api/planning/resources/{id} — COOPERATIVE, TECHNICIEN, ADMIN
    @PutMapping("/resources/{id}")
    @PreAuthorize("hasRole('COOPERATIVE') or hasRole('TECHNICIEN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateResource(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return resources.stream()
                .filter(r -> id.equals(r.get("id")))
                .findFirst()
                .map(resource -> {
                    resource.putAll(body);
                    resource.put("id", id);
                    return ResponseEntity.ok(resource);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━ Ownership helpers (SpEL) ━━━━━━━━━━━━━━━━━━━

    /** Vérifie que le user est le créateur de la tâche */
    public boolean isTaskOwner(String id, String email) {
        return taskRepository.findById(id)
                .map(t -> email.equals(t.getOwnerEmail()))
                .orElse(false);
    }

    /** Vérifie que la tâche est assignée au technicien authentifié */
    public boolean isAssignedTo(String id, String email) {
        return taskRepository.findById(id)
                .map(t -> email.equals(t.getAssignedTo()))
                .orElse(false);
    }

    /** Vérifie si le user peut créer une tâche (tolérant aux variantes ROLE_/case) */
    public boolean canCreateTasks(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .map(a -> a.getAuthority() == null ? "" : a.getAuthority().trim().toUpperCase())
                .map(a -> a.startsWith("ROLE_") ? a.substring(5) : a)
                .anyMatch(a -> a.equals("ADMIN") || a.equals("COOPERATIVE") || a.equals("PRODUCTEUR"));
    }
}
