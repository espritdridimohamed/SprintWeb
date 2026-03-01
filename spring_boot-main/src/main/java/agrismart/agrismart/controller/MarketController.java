package agrismart.agrismart.controller;

import agrismart.agrismart.model.Offer;
import agrismart.agrismart.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * MarketController — CRUD sécurisé par rôle
 *
 * Logique métier :
 * - PRODUCTEUR : crée ses propres offres, peut modifier/supprimer SEULEMENT les
 * siennes
 * - COOPERATIVE : valide les offres producteurs, gère les offres groupées
 * - ADMIN : accès complet + modification des prix de référence
 * - Autres : lecture seule (TECHNICIEN, ONG, ETAT, VIEWER)
 */
@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:4200")
public class MarketController {

    @Autowired
    private OfferRepository offerRepository;

    // ─── GET /api/market/offers — tous les rôles authentifiés ─────────────────
    @GetMapping("/offers")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Offer>> getAllOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    // ─── POST /api/market/offers — PRODUCTEUR seulement ───────────────────────
    @PostMapping("/offers")
    @PreAuthorize("hasRole('PRODUCTEUR')")
    public ResponseEntity<Offer> createOffer(
            @RequestBody Offer offer,
            Authentication auth) {
        offer.setOwnerEmail(auth.getName()); // email from JWT subject
        offer.setStatus("pending");
        offer.setDate(new java.util.Date());
        return ResponseEntity.ok(offerRepository.save(offer));
    }

    // ─── PUT /api/market/offers/{id} — PRODUCTEUR (owner) ou ADMIN ────────────
    @PutMapping("/offers/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PRODUCTEUR') and @marketController.isOwner(#id, authentication.name))")
    public ResponseEntity<Offer> updateOffer(
            @PathVariable String id,
            @RequestBody Offer body) {
        return offerRepository.findById(id)
                .map(offer -> {
                    offer.setProduct(body.getProduct());
                    offer.setQuantity(body.getQuantity());
                    offer.setUnit(body.getUnit());
                    offer.setPrice(body.getPrice());
                    offer.setQuality(body.getQuality());
                    offer.setAvailability(body.getAvailability());
                    return ResponseEntity.ok(offerRepository.save(offer));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── DELETE /api/market/offers/{id} — PRODUCTEUR (owner) ou ADMIN ─────────
    @DeleteMapping("/offers/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('PRODUCTEUR') and @marketController.isOwner(#id, authentication.name))")
    public ResponseEntity<Void> deleteOffer(@PathVariable String id) {
        if (offerRepository.existsById(id)) {
            offerRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ─── PUT /api/market/offers/{id}/validate — COOPERATIVE ou ADMIN ──────────
    @PutMapping("/offers/{id}/validate")
    @PreAuthorize("hasRole('COOPERATIVE') or hasRole('ADMIN')")
    public ResponseEntity<Offer> validateOffer(@PathVariable String id) {
        return offerRepository.findById(id)
                .map(offer -> {
                    offer.setStatus("validated");
                    return ResponseEntity.ok(offerRepository.save(offer));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─── GET /api/market/prices — tous authentifiés (simulation pour l'instant) ──
    @GetMapping("/prices")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getPrices() {
        // En attendant un PriceRepository, on laisse un mock minimaliste
        List<Map<String, Object>> prices = Arrays.asList(
                Map.of("id", "1", "product", "Tomates", "region", "Nord", "currentPrice", 2.5, "trend", 8.7),
                Map.of("id", "2", "product", "Blé", "region", "Centre", "currentPrice", 0.8, "trend", 3.9));
        return ResponseEntity.ok(prices);
    }

    // ─── POST /api/market/grouped-offers ───────────────────────────────────────
    @PostMapping("/grouped-offers")
    @PreAuthorize("hasRole('COOPERATIVE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createGroupedOffer(
            @RequestBody Map<String, Object> body) {
        body.put("id", UUID.randomUUID().toString());
        body.put("status", "En attente");
        return ResponseEntity.ok(body); // Simulation
    }

    // ─── Ownership helper ──────────────────────────────────────────────────────
    public boolean isOwner(String id, String email) {
        return offerRepository.findById(id)
                .map(o -> email.equals(o.getOwnerEmail()))
                .orElse(false);
    }
}
