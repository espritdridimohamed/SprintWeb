import { Injectable } from '@angular/core';
import { Observable, of, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import { Noeud, Mesure, AlerteCapteur } from '../models/sensor.model';

@Injectable({ providedIn: 'root' })
export class SensorService {

  // ── Mock data ──────────────────────────────────────────────

  private noeuds: Noeud[] = [
    { id: 'NODE_A3_01', parcelleId: 'P001', nom: 'Nœud A3-01', statut: 'online',
      batterie: 3.85, signalRssi: -72, derniereMesure: new Date(), localisation: 'Parcelle Nord A' },
    { id: 'NODE_B2_01', parcelleId: 'P002', nom: 'Nœud B2-01', statut: 'alerte',
      batterie: 3.42, signalRssi: -88, derniereMesure: new Date(), localisation: 'Parcelle Sud B' },
    { id: 'NODE_C1_01', parcelleId: 'P003', nom: 'Nœud C1-01', statut: 'online',
      batterie: 4.01, signalRssi: -65, derniereMesure: new Date(), localisation: 'Parcelle Est C' },
    { id: 'NODE_C1_02', parcelleId: 'P003', nom: 'Nœud C1-02', statut: 'offline',
      batterie: 3.10, signalRssi: -110, derniereMesure: new Date(Date.now() - 3600000), localisation: 'Parcelle Est C' },
  ];

  private mesures: Mesure[] = [
    { id: 'M001', noeudId: 'NODE_A3_01', timestamp: new Date(),
      hum_sol: 45.2, temp_sol: 18.5, temp_air: 22.3, hum_air: 65.0, pression: 1013.25, pluie_mm: 2.4, batterie: 3.85 },
    { id: 'M002', noeudId: 'NODE_B2_01', timestamp: new Date(),
      hum_sol: 18.7, temp_sol: 21.0, temp_air: 24.1, hum_air: 72.0, pression: 1011.80, pluie_mm: 0.0, batterie: 3.42 },
    { id: 'M003', noeudId: 'NODE_C1_01', timestamp: new Date(),
      hum_sol: 55.8, temp_sol: 17.2, temp_air: 21.0, hum_air: 58.5, pression: 1014.00, pluie_mm: 0.8, batterie: 4.01 },
  ];

  private alertes: AlerteCapteur[] = [
    { id: 'A001', noeudId: 'NODE_B2_01', parcelle: 'Parcelle Sud B', type: 'Humidité Sol',
      message: 'Sol très sec – irrigation urgente requise', valeur: 18.7, seuil: 25,
      timestamp: new Date(Date.now() - 1800000), niveau: 'danger', traitee: false },
    { id: 'A002', noeudId: 'NODE_C1_02', parcelle: 'Parcelle Est C', type: 'Connectivité',
      message: 'Nœud hors ligne depuis 1h', valeur: 0, seuil: 0,
      timestamp: new Date(Date.now() - 3600000), niveau: 'warning', traitee: false },
    { id: 'A003', noeudId: 'NODE_A3_01', parcelle: 'Parcelle Nord A', type: 'Batterie',
      message: 'Niveau batterie correct', valeur: 3.85, seuil: 3.3,
      timestamp: new Date(Date.now() - 7200000), niveau: 'info', traitee: true },
  ];

  // ── Historique simulé (7 derniers jours) ──────────────────

  getHistorique(noeudId: string, jours = 7): Observable<Mesure[]> {
    const hist: Mesure[] = [];
    for (let i = jours * 4; i >= 0; i--) {
      hist.push({
        id: `H${i}`, noeudId,
        timestamp: new Date(Date.now() - i * 15 * 60 * 1000),
        hum_sol: 35 + Math.random() * 30,
        temp_sol: 16 + Math.random() * 8,
        temp_air: 18 + Math.random() * 12,
        hum_air: 50 + Math.random() * 30,
        pression: 1010 + Math.random() * 8,
        pluie_mm: Math.random() > 0.8 ? Math.random() * 5 : 0,
        batterie: 3.85 - i * 0.001
      });
    }
    return of(hist);
  }

  // ── Méthodes ───────────────────────────────────────────────

  getNoeuds(): Observable<Noeud[]> { return of(this.noeuds); }

  getNoeudsByParcelle(parcelleId: string): Observable<Noeud[]> {
    return of(this.noeuds.filter(n => n.parcelleId === parcelleId));
  }

  getMesuresActuelles(): Observable<Mesure[]> { return of(this.mesures); }

  getMesureByNoeud(noeudId: string): Observable<Mesure | undefined> {
    return of(this.mesures.find(m => m.noeudId === noeudId));
  }

  getAlertes(): Observable<AlerteCapteur[]> { return of(this.alertes); }

  getNouvellesAlertes(): Observable<AlerteCapteur[]> {
    return of(this.alertes.filter(a => !a.traitee));
  }

  marquerTraitee(id: string): void {
    const a = this.alertes.find(x => x.id === id);
    if (a) a.traitee = true;
  }

  getStatsNoeuds() {
    return {
      total: this.noeuds.length,
      online: this.noeuds.filter(n => n.statut === 'online').length,
      offline: this.noeuds.filter(n => n.statut === 'offline').length,
      alertes: this.noeuds.filter(n => n.statut === 'alerte').length
    };
  }

  getBatterieFaible(): Noeud[] {
    return this.noeuds.filter(n => n.batterie < 3.4);
  }

  // Statut couleur selon valeur
  getStatutHumSol(val: number): 'danger' | 'warning' | 'success' | 'info' {
    if (val < 20) return 'danger';
    if (val < 35) return 'warning';
    if (val <= 65) return 'success';
    return 'info';
  }

  getStatutTempAir(val: number): 'danger' | 'warning' | 'success' | 'info' {
    if (val < 5 || val > 38) return 'danger';
    if (val < 10 || val > 33) return 'warning';
    return 'success';
  }
}