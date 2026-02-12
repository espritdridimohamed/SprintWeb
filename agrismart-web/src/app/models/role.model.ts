export type RoleKey = 'technicien' | 'cooperative' | 'ong' | 'etat' | 'admin';

export interface NavItem {
  label: string;
  route: string;
  icon: string;
}

export interface KpiItem {
  label: string;
  value: string;
  trend?: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  icon?: string;
}

export interface PanelItem {
  title: string;
  subtitle?: string;
  items: string[];
  accent?: 'leaf' | 'sky' | 'amber' | 'rose' | 'indigo' | 'emerald';
}

export interface RoleConfig {
  key: RoleKey;
  label: string;
  orgLabel: string;
  nav: NavItem[];
  kpis: KpiItem[];
  panels: PanelItem[];
}
