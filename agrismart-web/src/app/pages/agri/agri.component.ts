import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { AgriService } from '../../services/agri.service';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { RoleKey, KpiItem } from '../../models/role.model';
import { Parcelle, MembreCoop } from '../../models/agri.model';

@Component({
  selector: 'app-agri',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent],
  templateUrl: './agri.component.html',
  styleUrl: './agri.component.scss'
})
export class AgriComponent implements OnInit, OnDestroy {
  role: RoleKey = 'technicien';
  private sub!: Subscription;

  parcelles: Parcelle[]   = [];
  membres:   MembreCoop[] = [];

  filtreStatut    = 'tous';
  filtreRecherche = '';

  constructor(
    private roleSvc: RoleService,
    private agriSvc: AgriService
  ) {}

  ngOnInit(): void {
    this.sub = this.roleSvc.role$.subscribe((r: RoleKey) => {
      this.role = r;
      this.chargerDonnees();
    });
  }

  chargerDonnees(): void {
    this.agriSvc.parcelles$.subscribe((d: Parcelle[])   => this.parcelles = d);
    this.agriSvc.membres$.subscribe((d: MembreCoop[])   => this.membres   = d);
  }

  get kpis(): KpiItem[] {
    const sp = this.agriSvc.getStatsParcelles();
    const sm = this.agriSvc.getStatsMembres();

    if (this.role === 'technicien') return [
      { label: 'Mes Parcelles',   value: sp.total.toString(),         icon: 'location_on', tone: 'brand'   },
      { label: 'Actives',         value: sp.actives.toString(),       icon: 'eco',         tone: 'success' },
      { label: 'En Alerte',       value: sp.alertes.toString(),       icon: 'warning',     tone: 'danger'  },
      { label: 'Superficie',      value: sp.superficieTotale + ' ha', icon: 'straighten',  tone: 'info'    },
    ];

    // Coopérative
    return [
      { label: 'Membres',         value: sm.total.toString(),         icon: 'group',       tone: 'brand'   },
      { label: 'Membres Actifs',  value: sm.actifs.toString(),        icon: 'how_to_reg',  tone: 'success' },
      { label: 'Total Parcelles', value: sp.total.toString(),         icon: 'location_on', tone: 'info'    },
      { label: 'Superficie',      value: sm.superficieTotale + ' ha', icon: 'straighten',  tone: 'brand'   },
    ];
  }

  get parcellesFiltrees(): Parcelle[] {
    return this.parcelles.filter((p: Parcelle) => {
      const matchStatut    = this.filtreStatut === 'tous' || p.statut === this.filtreStatut;
      const matchRecherche = p.nom.toLowerCase().includes(this.filtreRecherche.toLowerCase())
                          || p.culture.toLowerCase().includes(this.filtreRecherche.toLowerCase());
      return matchStatut && matchRecherche;
    });
  }

  get membresFiltres(): MembreCoop[] {
    return this.membres.filter((m: MembreCoop) =>
      `${m.nom} ${m.prenom}`.toLowerCase().includes(this.filtreRecherche.toLowerCase())
    );
  }

  statutLabel(s: string): string {
    const map: Record<string, string> = {
      active:   'Active',   inactive: 'Inactive', alerte:   'Alerte',
      actif:    'Actif',    inactif:  'Inactif',  suspendu: 'Suspendu'
    };
    return map[s] || s;
  }

  getParcellesNoms(membreId: string): string {
    return this.agriSvc.getParcellesNomsByMembre(membreId);
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }
}