export type StatutParcelle = 'active' | 'inactive' | 'alerte';
export type StatutCulture = 'en_cours' | 'recolte' | 'planifie';
export type StatutMembre = 'actif' | 'inactif' | 'suspendu';

export interface Parcelle {
  id: string;
  nom: string;
  superficie: number;       // hectares
  culture: string;
  statut: StatutParcelle;
  technicienId: string;
  localisation: string;
  noeudsIds: string[];
  dateCreation: Date;
}

export interface Culture {
  id: string;
  parcelleId: string;
  type: string;
  dateDebut: Date;
  datePrevueRecolte: Date;
  statut: StatutCulture;
  rendementPrevus: number;  // tonnes/ha
  notes: string;
}

export interface MembreCoop {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  parcelles: number;
  superficie: number;
  statut: StatutMembre;
  cooperativeId: string;
  technicienId: string;
}

export interface SeuilAlerte {
  id: string;
  noeudId: string;
  type: 'hum_sol' | 'temp_sol' | 'temp_air' | 'hum_air' | 'pluie_mm';
  min: number;
  max: number;
  actif: boolean;
}