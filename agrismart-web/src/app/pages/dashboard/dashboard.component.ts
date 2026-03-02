import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { ROLE_CONFIGS } from '../../data/role-config';
import { RoleKey } from '../../models/role.model';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

/* ── Admin API types ── */
interface DashboardUser {
  id?: string;
  roleId?: string;
  status?: string;
  createdAt?: string;
}

interface DashboardRole {
  id: string;
  name: string;
}

/* ── Visual dashboard types ── */
type ChartTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface VisualBar {
  label: string;
  score: number;
  valueLabel: string;
  icon: string;
  tone: ChartTone;
}

interface VisualSlice {
  label: string;
  percent: number;
  tone: ChartTone;
}

interface VisualStat {
  label: string;
  value: string;
  icon: string;
  tone: ChartTone;
}

interface RoleVisualData {
  performanceTitle: string;
  performanceSubtitle: string;
  distributionTitle: string;
  distributionSubtitle: string;
  bars: VisualBar[];
  slices: VisualSlice[];
  stats: VisualStat[];
}

/* ── Per-role visual data ── */
const ROLE_VISUALS: Record<RoleKey, RoleVisualData> = {
  viewer: {
    performanceTitle: 'Suivi commandes (4 semaines)',
    performanceSubtitle: 'Activité d\'achat hebdomadaire',
    distributionTitle: 'Répartition des achats',
    distributionSubtitle: 'Par catégorie de produit',
    bars: [
      { label: 'Sem 1', score: 45, valueLabel: '3 commandes', icon: 'shopping_cart', tone: 'info' },
      { label: 'Sem 2', score: 60, valueLabel: '5 commandes', icon: 'shopping_cart', tone: 'success' },
      { label: 'Sem 3', score: 52, valueLabel: '4 commandes', icon: 'shopping_cart', tone: 'brand' },
      { label: 'Sem 4', score: 70, valueLabel: '6 commandes', icon: 'shopping_cart', tone: 'warning' }
    ],
    slices: [
      { label: 'Fruits & Légumes', percent: 42, tone: 'success' },
      { label: 'Céréales', percent: 28, tone: 'info' },
      { label: 'Huiles & Olives', percent: 18, tone: 'brand' },
      { label: 'Autres', percent: 12, tone: 'warning' }
    ],
    stats: [
      { label: 'Commandes livrées', value: '92%', icon: 'local_shipping', tone: 'success' },
      { label: 'Panier moyen', value: '48 DT', icon: 'payments', tone: 'info' },
      { label: 'Économies', value: '12%', icon: 'savings', tone: 'brand' }
    ]
  },
  producteur: {
    performanceTitle: 'Performance parcelle (4 jours)',
    performanceSubtitle: 'Qualité opérationnelle des tâches agricoles',
    distributionTitle: 'Répartition activités de campagne',
    distributionSubtitle: 'Temps alloué par type d\'activité',
    bars: [
      { label: 'Lun', score: 58, valueLabel: '4 tâches complétées', icon: 'water_drop', tone: 'info' },
      { label: 'Mar', score: 63, valueLabel: '5 tâches complétées', icon: 'wb_sunny', tone: 'warning' },
      { label: 'Mer', score: 76, valueLabel: '7 tâches complétées', icon: 'eco', tone: 'success' },
      { label: 'Jeu', score: 72, valueLabel: '6 tâches complétées', icon: 'agriculture', tone: 'brand' }
    ],
    slices: [
      { label: 'Irrigation', percent: 41, tone: 'info' },
      { label: 'Suivi culture', percent: 34, tone: 'success' },
      { label: 'Marché', percent: 25, tone: 'brand' }
    ],
    stats: [
      { label: 'Risque météo', value: 'Faible', icon: 'cloud_done', tone: 'success' },
      { label: 'Prix marché', value: '+7%', icon: 'sell', tone: 'info' },
      { label: 'Objectif récolte', value: '82%', icon: 'target', tone: 'brand' }
    ]
  },
  technicien: {
    performanceTitle: 'Performance terrain hebdomadaire',
    performanceSubtitle: 'Suivi des opérations clés par semaine',
    distributionTitle: 'Répartition état des parcelles',
    distributionSubtitle: 'Segmentations des parcelles suivies',
    bars: [
      { label: 'Sem 1', score: 62, valueLabel: '31 interventions', icon: 'agriculture', tone: 'success' },
      { label: 'Sem 2', score: 71, valueLabel: '37 interventions', icon: 'water_drop', tone: 'info' },
      { label: 'Sem 3', score: 78, valueLabel: '41 interventions', icon: 'psychology', tone: 'brand' },
      { label: 'Sem 4', score: 69, valueLabel: '35 interventions', icon: 'task_alt', tone: 'warning' }
    ],
    slices: [
      { label: 'Parcelles saines', percent: 58, tone: 'success' },
      { label: 'Sous surveillance', percent: 27, tone: 'warning' },
      { label: 'Intervention urgente', percent: 15, tone: 'danger' }
    ],
    stats: [
      { label: 'Diagnostics validés', value: '94%', icon: 'verified', tone: 'success' },
      { label: 'Temps moyen décision', value: '18m', icon: 'schedule', tone: 'info' },
      { label: 'Taux résolution', value: '87%', icon: 'trending_up', tone: 'brand' }
    ]
  },
  cooperative: {
    performanceTitle: 'Performance production mensuelle',
    performanceSubtitle: 'Volume collecté et vendu par mois',
    distributionTitle: 'Répartition production par filière',
    distributionSubtitle: 'Part des cultures sur le total coopérative',
    bars: [
      { label: 'Jan', score: 54, valueLabel: '820 t collectées', icon: 'eco', tone: 'success' },
      { label: 'Fév', score: 66, valueLabel: '940 t collectées', icon: 'warehouse', tone: 'info' },
      { label: 'Mar', score: 74, valueLabel: '1 060 t collectées', icon: 'local_shipping', tone: 'brand' },
      { label: 'Avr', score: 81, valueLabel: '1 180 t collectées', icon: 'payments', tone: 'warning' }
    ],
    slices: [
      { label: 'Blé', percent: 34, tone: 'success' },
      { label: 'Tomate', percent: 29, tone: 'info' },
      { label: 'Maïs', percent: 22, tone: 'brand' },
      { label: 'Olive', percent: 15, tone: 'warning' }
    ],
    stats: [
      { label: 'Rendement moyen', value: '+12%', icon: 'trending_up', tone: 'success' },
      { label: 'Commandes groupées', value: '43', icon: 'inventory_2', tone: 'info' },
      { label: 'Marge nette', value: '24%', icon: 'monitoring', tone: 'brand' }
    ]
  },
  ong: {
    performanceTitle: 'Performance programme par région',
    performanceSubtitle: 'Taux de couverture des activités terrain',
    distributionTitle: 'Répartition budget opérationnel',
    distributionSubtitle: 'Affectation des ressources par programme',
    bars: [
      { label: 'Nord', score: 82, valueLabel: '1 180 bénéficiaires', icon: 'public', tone: 'success' },
      { label: 'Sud', score: 67, valueLabel: '920 bénéficiaires', icon: 'public', tone: 'info' },
      { label: 'Est', score: 59, valueLabel: '710 bénéficiaires', icon: 'public', tone: 'warning' },
      { label: 'Ouest', score: 76, valueLabel: '1 030 bénéficiaires', icon: 'public', tone: 'brand' }
    ],
    slices: [
      { label: 'Formations', percent: 32, tone: 'success' },
      { label: 'Irrigation', percent: 28, tone: 'info' },
      { label: 'Accompagnement', percent: 22, tone: 'brand' },
      { label: 'Innovation', percent: 18, tone: 'warning' }
    ],
    stats: [
      { label: 'Participation', value: '91%', icon: 'groups', tone: 'success' },
      { label: 'Coûts/benef.', value: '1.9x', icon: 'analytics', tone: 'info' },
      { label: 'Impact validé', value: '84%', icon: 'task_alt', tone: 'brand' }
    ]
  },
  etat: {
    performanceTitle: 'Performance macro-indicateurs',
    performanceSubtitle: 'Suivi opérationnel des métriques nationales',
    distributionTitle: 'Répartition niveau de risque',
    distributionSubtitle: 'Statut des zones agricoles monitorées',
    bars: [
      { label: 'Alertes traitées <24h', score: 73, valueLabel: '73% alertes clôturées', icon: 'notifications_active', tone: 'success' },
      { label: 'Couverture régionale', score: 81, valueLabel: '81% des régions suivies', icon: 'map', tone: 'info' },
      { label: 'Qualité données terrain', score: 76, valueLabel: '76% données fiables', icon: 'fact_check', tone: 'brand' },
      { label: 'Décisions exécutées', score: 68, valueLabel: '68% actions appliquées', icon: 'gavel', tone: 'warning' }
    ],
    slices: [
      { label: 'Zones stables', percent: 46, tone: 'success' },
      { label: 'Zones modérées', percent: 33, tone: 'warning' },
      { label: 'Zones critiques', percent: 21, tone: 'danger' }
    ],
    stats: [
      { label: 'Alertes traitées', value: '73%', icon: 'notifications_active', tone: 'success' },
      { label: 'Décisions validées', value: '18', icon: 'gavel', tone: 'info' },
      { label: 'Indice national', value: '74%', icon: 'insights', tone: 'brand' }
    ]
  },
  admin: {
    performanceTitle: 'Performance infrastructure',
    performanceSubtitle: 'Disponibilité des services critiques',
    distributionTitle: 'Répartition des utilisateurs',
    distributionSubtitle: 'Segments actifs sur la plateforme',
    bars: [
      { label: 'API', score: 96, valueLabel: '99.3% uptime', icon: 'api', tone: 'success' },
      { label: 'MQTT', score: 92, valueLabel: '98.7% uptime', icon: 'sensors', tone: 'info' },
      { label: 'IA', score: 88, valueLabel: '97.9% uptime', icon: 'neurology', tone: 'brand' },
      { label: 'Gateway', score: 84, valueLabel: '96.8% uptime', icon: 'router', tone: 'warning' }
    ],
    slices: [
      { label: 'Producteurs', percent: 52, tone: 'success' },
      { label: 'Coopératives', percent: 23, tone: 'info' },
      { label: 'ONG/Projets', percent: 15, tone: 'brand' },
      { label: 'Acteurs État', percent: 10, tone: 'warning' }
    ],
    stats: [
      { label: 'Disponibilité', value: '99.2%', icon: 'verified_user', tone: 'success' },
      { label: 'Latence P95', value: '1.2s', icon: 'speed', tone: 'info' },
      { label: 'Incidents /24h', value: '3', icon: 'error', tone: 'danger' }
    ]
  }
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, SectionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  isLoading = false;
  users: DashboardUser[] = [];
  roles: DashboardRole[] = [];

  constructor(public roleService: RoleService, private http: HttpClient) { }

  ngOnInit(): void {
    if (this.isAdminView) {
      this.loadAdminSummary();
    }
  }

  get roleConfig() {
    return ROLE_CONFIGS[this.roleService.role];
  }

  get isAdminView(): boolean {
    return this.roleService.role === 'admin';
  }

  /* ── Visual data for all roles ── */
  get visualData(): RoleVisualData {
    return ROLE_VISUALS[this.roleService.role];
  }

  get maxBarValue(): number {
    const max = Math.max(...this.visualData.bars.map((bar) => bar.score));
    return max > 0 ? max : 1;
  }

  get donutBackground(): string {
    let cursor = 0;
    const segments = this.visualData.slices.map((slice) => {
      const from = cursor;
      const to = cursor + slice.percent;
      cursor = to;
      return `${this.toneColor(slice.tone)} ${from}% ${to}%`;
    });
    return `conic-gradient(${segments.join(', ')})`;
  }

  getBarWidth(score: number): string {
    return `${(score / this.maxBarValue) * 100}%`;
  }

  toneColor(tone: ChartTone): string {
    switch (tone) {
      case 'success': return '#2f9d57';
      case 'info': return '#347ad4';
      case 'warning': return '#d9820f';
      case 'danger': return '#c43e3e';
      case 'brand': return '#6b9f3e';
      default: return '#8a9786';
    }
  }

  /* ── Admin-specific getters ── */
  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  }

  get rolesCount(): number {
    return this.roles.length;
  }

  get newUsersThisWeek(): number {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }
      return new Date(user.createdAt).getTime() >= weekAgo;
    }).length;
  }

  get roleDistribution(): Array<{ label: string; value: number }> {
    return this.roles.map((role) => ({
      label: role.name,
      value: this.users.filter((user) => user.roleId === role.id).length
    }));
  }

  private loadAdminSummary(): void {
    this.isLoading = true;

    forkJoin({
      users: this.http.get<DashboardUser[]>(`${this.apiBaseUrl}/users`),
      roles: this.http.get<DashboardRole[]>(`${this.apiBaseUrl}/roles`)
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users ?? [];
        this.roles = roles ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}