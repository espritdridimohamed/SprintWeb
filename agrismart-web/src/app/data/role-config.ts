import { RoleConfig, RoleKey } from '../models/role.model';

export const ROLE_CONFIGS: Record<RoleKey, RoleConfig> = {
  technicien: {
    key: 'technicien',
    label: 'Technicien Agricole',
    orgLabel: 'AgriTech Services',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Gestion Agricole', route: '/app/agri', icon: 'agri' },
      { label: 'IA & Conseils', route: '/app/ai', icon: 'ai' },
      { label: 'Appui Technique', route: '/app/support', icon: 'support' },
      { label: 'Alertes', route: '/app/alerts', icon: 'alerts' }
    ],
    kpis: [
      { label: 'Producteurs suivis', value: '47', trend: '+3 ce mois', tone: 'info', icon: 'users' },
      { label: 'Parcelles actives', value: '142', trend: '+8 cette semaine', tone: 'success', icon: 'pin' },
      { label: 'Diagnostics IA', value: '23', trend: 'Aujourd\'hui', tone: 'brand', icon: 'brain' },
      { label: 'Interventions en cours', value: '8', tone: 'warning', icon: 'alert' }
    ],
    panels: [
      {
        title: 'Demandes d\'appui technique',
        subtitle: '3 en attente',
        items: [
          'Ahmed Benali · Parcelle A-12 · Maladie des feuilles · Urgent',
          'Fatima Zahra · Parcelle B-05 · Problème irrigation · Moyen',
          'Ali Mansour · Parcelle C-23 · Carence nutritionnelle · Normal'
        ],
        accent: 'rose'
      },
      {
        title: 'Diagnostics IA récents',
        subtitle: 'Validation requise',
        items: [
          'Tomate · Mildiou · Confiance 94% · À vérifier',
          'Blé · Rouille jaune · Confiance 87% · À vérifier',
          'Maïs · Stress hydrique · Confiance 92% · Confirmé'
        ],
        accent: 'indigo'
      }
    ]
  },
  cooperative: {
    key: 'cooperative',
    label: 'Coopérative Agricole',
    orgLabel: 'Coopérative Agricole du Nord',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Gestion Agricole', route: '/app/agri', icon: 'agri' },
      { label: 'Planification', route: '/app/planning', icon: 'calendar' },
      { label: 'Agro-Marché', route: '/app/market', icon: 'market' },
      { label: 'Formations', route: '/app/training', icon: 'training' },
      { label: 'Recommandations', route: '/app/recommendations', icon: 'auto_awesome' },
      { label: 'Alertes', route: '/app/alerts', icon: 'alerts' },
      { label: 'Rapports', route: '/app/rapports', icon: 'reports' }
    ],
    kpis: [
      { label: 'Membres actifs', value: '156', trend: '+12 ce mois', tone: 'info', icon: 'users' },
      { label: 'Production totale', value: '3,290 t', trend: 'Ce mois', tone: 'success', icon: 'leaf' },
      { label: 'Chiffre d\'affaires', value: '2.4M', trend: '+18% vs mois dernier', tone: 'brand', icon: 'trend' },
      { label: 'Événements planifiés', value: '8', trend: 'Ce mois', tone: 'warning', icon: 'calendar' }
    ],
    panels: [
      {
        title: 'Évolution de la production',
        subtitle: '6 derniers mois',
        items: [
          'Blé +12%',
          'Tomate +8%',
          'Maïs +6%'
        ],
        accent: 'emerald'
      },
      {
        title: 'Ventes par produit',
        subtitle: 'Top 4',
        items: [
          'Tomates · 2.1M',
          'Blé · 1.7M',
          'Maïs · 1.2M',
          'Olives · 0.9M'
        ],
        accent: 'amber'
      }
    ]
  },
  ong: {
    key: 'ong',
    label: 'ONG / Projet Agricole',
    orgLabel: 'AgriDev International',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Formations', route: '/app/training', icon: 'training' },
      { label: 'E-learning', route: '/app/e-learning', icon: 'school' },
      { label: 'Analyse & Impact', route: '/app/impact', icon: 'impact' }
    ],
    kpis: [
      { label: 'Bénéficiaires totaux', value: '2,420', trend: '+15% ce trimestre', tone: 'info', icon: 'users' },
      { label: 'Projets actifs', value: '12', trend: 'Dans 5 régions', tone: 'success', icon: 'pin' },
      { label: 'Formations dispensées', value: '48', trend: '+8 ce mois', tone: 'brand', icon: 'training' },
      { label: 'Taux de réussite', value: '87%', trend: 'Indicateur global', tone: 'warning', icon: 'trend' }
    ],
    panels: [
      {
        title: 'Bénéficiaires par région',
        subtitle: 'Nord, Sud, Est, Ouest, Centre',
        items: [
          'Nord · 420',
          'Sud · 680',
          'Est · 310',
          'Ouest · 540',
          'Centre · 390'
        ],
        accent: 'emerald'
      },
      {
        title: 'Répartition budget',
        subtitle: 'Programmes 2026',
        items: [
          'Formations · 32%',
          'Irrigation · 28%',
          'Accompagnement · 22%',
          'Innovation · 18%'
        ],
        accent: 'sky'
      }
    ]
  },
  etat: {
    key: 'etat',
    label: 'Acteur Étatique',
    orgLabel: 'Ministère Agriculture',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Analyse & Impact', route: '/app/impact', icon: 'impact' },
      { label: 'Communications', route: '/app/communications', icon: 'report' },
      { label: 'Exports décision', route: '/app/exports-decision', icon: 'download' }
    ],
    kpis: [
      { label: 'Alertes nationales', value: '18', trend: 'Dernières 48h', tone: 'danger', icon: 'alert' },
      { label: 'Indice de rendement', value: '74%', trend: '+2% QoQ', tone: 'info', icon: 'trend' },
      { label: 'Risque climatique', value: 'Modéré', trend: 'Mise à jour 12h', tone: 'warning', icon: 'cloud' },
      { label: 'Actions politiques', value: '6', trend: 'En validation', tone: 'brand', icon: 'flag' }
    ],
    panels: [
      {
        title: 'Statistiques agrégées',
        subtitle: 'Comparaison annuelle',
        items: [
          'Production céréales +4%',
          'Irrigation +6%',
          'Exportations +3%'
        ],
        accent: 'amber'
      },
      {
        title: 'Communications officielles',
        subtitle: 'À publier',
        items: [
          'Alerte sécheresse · Draft',
          'Programme subvention · En revue',
          'Campagne phytosanitaire · Prêt'
        ],
        accent: 'rose'
      }
    ]
  },
  admin: {
    key: 'admin',
    label: 'Administrateur Système',
    orgLabel: 'AgriSmart Cloud',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Administration', route: '/app/admin', icon: 'admin' },
      { label: 'E-learning', route: '/app/e-learning', icon: 'school' },
      { label: 'IoT & Passerelles', route: '/app/iot', icon: 'iot' },
      { label: 'Logs & Audit', route: '/app/logs', icon: 'logs' },
      { label: 'Modéles IA', route: '/app/modeles-ia', icon: 'ai' }
    ],
    kpis: [
      { label: 'Utilisateurs actifs', value: '1,824', trend: '+6% ce mois', tone: 'info', icon: 'users' },
      { label: 'Capteurs en ligne', value: '4,912', trend: '98.2% uptime', tone: 'success', icon: 'iot' },
      { label: 'Alertes sécurité', value: '3', trend: '24h', tone: 'danger', icon: 'alert' },
      { label: 'Latence moyenne', value: '1.2s', trend: 'Sous seuil', tone: 'brand', icon: 'speed' }
    ],
    panels: [
      {
        title: 'Audit & Conformité',
        subtitle: 'Derniers événements',
        items: [
          'RBAC mis à jour · 2h',
          'Modèle IA v3.2 publié · 6h',
          'Passerelle NW-12 redémarrée · 9h'
        ],
        accent: 'indigo'
      },
      {
        title: 'Santé du système',
        subtitle: 'Services critiques',
        items: [
          'MQTTS · OK',
          'API REST · OK',
          'Base temporelle · OK'
        ],
        accent: 'emerald'
      }
    ]
  },
  agriculteur: {
    key: 'agriculteur',
    label: 'Agriculteur / Producteur',
    orgLabel: 'Exploitation Familiale',
    nav: [
      { label: 'Tableau de bord', route: '/app/dashboard', icon: 'dashboard' },
      { label: 'Dashboard IA', route: '/app/dashboard-ia', icon: 'cloud' },
      { label: 'E-learning', route: '/app/e-learning', icon: 'school' },
      { label: 'Gestion Parcelles', route: '/app/agri', icon: 'agri' },
      { label: 'Marché Agricole', route: '/app/market', icon: 'market' }
    ],
    kpis: [
      { label: 'Surface cultivée', value: '12.5 ha', trend: '+1.5 ha cette saison', tone: 'info', icon: 'pin' },
      { label: 'Récolte prévue', value: '145 t', trend: 'Est. Maïs/Blé', tone: 'success', icon: 'leaf' },
      { label: 'Cours terminés', value: '4/12', trend: '+2 cette semaine', tone: 'brand', icon: 'training' },
      { label: 'Alertes météo', value: '0', trend: 'Aucun risque', tone: 'neutral', icon: 'cloud' }
    ],
    panels: [
      {
        title: 'Tâches prioritaires',
        subtitle: 'Prochains 48h',
        items: [
          'Irrigation Parcelle B · Aujourd\'hui 18h',
          'Application engrais · Demain matin',
          'Récolte zone C · Jeudi'
        ],
        accent: 'leaf'
      },
      {
        title: 'Cours suggérés',
        subtitle: 'Selon votre profil',
        items: [
          'Optimisation irrigation goutte-à-goutte',
          'Protection naturelle contre les nuisibles',
          'Vendre au meilleur prix sur le marché'
        ],
        accent: 'indigo'
      }
    ]
  }
};
