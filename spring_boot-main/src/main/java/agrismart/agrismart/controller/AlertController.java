package agrismart.agrismart.controller;

import agrismart.agrismart.model.Alert;
import agrismart.agrismart.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

/**
 * AlertController — CRUD pour les alertes / notifications
 *
 * - Tous authentifiés : lecture
 * - PRODUCTEUR, COOPERATIVE, TECHNICIEN, ADMIN : création
 * - ADMIN : suppression, résolution
 * - Propriétaire ou ADMIN : résolution
 */
@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:4200")
public class AlertController {

    @Autowired
    private AlertRepository alertRepository;

    // GET /api/alerts — toutes les alertes (actives d'abord)
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Alert>> getAll() {
        return ResponseEntity.ok(alertRepository.findAllByOrderByCreatedAtDesc());
    }

    // GET /api/alerts/active — alertes non résolues
    @GetMapping("/active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Alert>> getActive() {
        return ResponseEntity.ok(alertRepository.findByResolvedFalseOrderByCreatedAtDesc());
    }

    // POST /api/alerts — créer une alerte
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Alert> create(
            @RequestBody Alert alert,
            Authentication auth) {
        alert.setCreatedBy(auth.getName());
        alert.setCreatedAt(new Date());
        alert.setResolved(false);
        if (alert.getSeverity() == null || alert.getSeverity().isBlank()) {
            alert.setSeverity("info");
        }
        return ResponseEntity.ok(alertRepository.save(alert));
    }

    // PUT /api/alerts/{id}/resolve — marquer comme résolue
    @PutMapping("/{id}/resolve")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Alert> resolve(@PathVariable String id) {
        return alertRepository.findById(id)
                .map(alert -> {
                    alert.setResolved(true);
                    alert.setResolvedAt(new Date());
                    return ResponseEntity.ok(alertRepository.save(alert));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/alerts/{id} — supprimer une alerte (ADMIN)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (alertRepository.existsById(id)) {
            alertRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
