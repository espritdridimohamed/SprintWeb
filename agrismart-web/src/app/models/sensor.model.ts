export type StatutNoeud = 'online' | 'offline' | 'alerte';

export interface Noeud {
  id: string;             // ex: NODE_A3_01
  parcelleId: string;
  nom: string;
  statut: StatutNoeud;
  batterie: number;       // volts (3.0 - 4.2)
  signalRssi: number;     // dBm (-30 à -120)
  derniereMesure: Date;
  localisation: string;
}

export interface Mesure {
  id: string;
  noeudId: string;
  timestamp: Date;
  hum_sol: number;        // % (0-100)
  temp_sol: number;       // °C
  temp_air: number;       // °C
  hum_air: number;        // % (0-100)
  pression: number;       // hPa
  pluie_mm: number;       // mm
  batterie: number;       // volts
}

export interface AlerteCapteur {
  id: string;
  noeudId: string;
  parcelle: string;
  type: string;
  message: string;
  valeur: number;
  seuil: number;
  timestamp: Date;
  niveau: 'info' | 'warning' | 'danger';
  traitee: boolean;
}