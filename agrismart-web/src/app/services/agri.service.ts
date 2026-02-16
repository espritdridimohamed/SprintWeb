import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Parcelle, MembreCoop, SeuilAlerte } from '../models/agri.model';

@Injectable({ providedIn: 'root' })
export class AgriService {

  private readonly parcellesSubject = new BehaviorSubject<Parcelle[]>([
    { id: 'P001', nom: 'Parcelle Manouba A', superficie: 3.2, culture: 'Tomates',
      statut: 'active',   technicienId: 'T01', localisation: 'Manouba, Zone Nord',
      noeudsIds: ['NODE_A3_01', 'NODE_A3_02'], dateCreation: new Date('2025-01-15') },
    { id: 'P002', nom: 'Parcelle Bizerte B', superficie: 2.5, culture: 'Mais',
      statut: 'alerte',   technicienId: 'T01', localisation: 'Bizerte, Zone Sud',
      noeudsIds: ['NODE_B2_01'], dateCreation: new Date('2025-02-20') },
    { id: 'P003', nom: 'Parcelle Beja C',    superficie: 4.1, culture: 'Haricots',
      statut: 'active',   technicienId: 'T02', localisation: 'Beja, Zone Est',
      noeudsIds: ['NODE_C1_01'], dateCreation: new Date('2025-03-10') },
    { id: 'P004', nom: 'Parcelle Nabeul D',  superficie: 1.8, culture: 'Oignons',
      statut: 'inactive', technicienId: 'T02', localisation: 'Nabeul, Zone Ouest',
      noeudsIds: [], dateCreation: new Date('2025-04-05') },
    { id: 'P005', nom: 'Parcelle Sfax E',    superficie: 2.9, culture: 'Oliviers',
      statut: 'active',   technicienId: 'T01', localisation: 'Sfax, Zone Centre',
      noeudsIds: ['NODE_E1_01'], dateCreation: new Date('2025-01-28') },
  ]);

  private readonly membresSubject = new BehaviorSubject<MembreCoop[]>([
    { id: 'M001', nom: 'Ben Youssef', prenom: 'Hiba',     telephone: '+216 22 134 567',
      parcelles: 3, superficie: 6.2, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T01' },
    { id: 'M002', nom: 'Jebali',      prenom: 'Hassen',  telephone: '+216 55 987 654',
      parcelles: 2, superficie: 4.5, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T01' },
    { id: 'M003', nom: 'Belhaj',      prenom: 'Yassine', telephone: '+216 98 456 123',
      parcelles: 4, superficie: 8.1, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T02' },
    { id: 'M004', nom: 'Hamadi',      prenom: 'Yassine', telephone: '+216 20 321 789',
      parcelles: 1, superficie: 2.9, statut: 'inactif',  cooperativeId: 'C01', technicienId: 'T02' },
    { id: 'M005', nom: 'Sansa',       prenom: 'Rayen',   telephone: '+216 50 654 321',
      parcelles: 2, superficie: 3.8, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T01' },
    { id: 'M006', nom: 'Dridi',       prenom: 'Mohamed', telephone: '+216 24 789 456',
      parcelles: 3, superficie: 5.5, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T02' },
    { id: 'M007', nom: 'Harrane',     prenom: 'Youssef', telephone: '+216 29 654 987',
      parcelles: 1, superficie: 2.1, statut: 'actif',    cooperativeId: 'C01', technicienId: 'T01' },
  ]);

  private readonly seuilsSubject = new BehaviorSubject<SeuilAlerte[]>([
    { id: 'S001', noeudId: 'NODE_A3_01', type: 'hum_sol',  min: 30, max: 80, actif: true },
    { id: 'S002', noeudId: 'NODE_B2_01', type: 'temp_air', min: 5,  max: 38, actif: true },
  ]);

  parcelles$ = this.parcellesSubject.asObservable();
  membres$   = this.membresSubject.asObservable();
  seuils$    = this.seuilsSubject.asObservable();

  get parcelles(): Parcelle[]    { return this.parcellesSubject.value; }
  get membres():   MembreCoop[]  { return this.membresSubject.value;   }
  get seuils():    SeuilAlerte[] { return this.seuilsSubject.value;    }

  getStatsParcelles() {
    const p = this.parcelles;
    return {
      total:            p.length,
      actives:          p.filter(x => x.statut === 'active').length,
      alertes:          p.filter(x => x.statut === 'alerte').length,
      superficieTotale: p.reduce((a, x) => a + x.superficie, 0).toFixed(1),
    };
  }

  getStatsMembres() {
    const m = this.membres;
    return {
      total:            m.length,
      actifs:           m.filter(x => x.statut === 'actif').length,
      superficieTotale: m.reduce((a, x) => a + x.superficie, 0).toFixed(1),
    };
  }

  getParcellesByMembre(membreId: string): Parcelle[] {
    return this.parcelles.filter(p => {
      const membre = this.membres.find(m => m.id === membreId);
      return membre && p.technicienId === membre.technicienId;
    });
  }

  getParcellesNomsByMembre(membreId: string): string {
    const parcelles = this.getParcellesByMembre(membreId);
    return parcelles.map(p => p.nom).join(', ') || 'Aucune';
  }
}