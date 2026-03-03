import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KpiItem } from '../../models/role.model';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss'
})
export class KpiCardComponent {
  @Input() item!: KpiItem;

  constructor(private router: Router) {}

  navigate(): void {
    if (this.item.route) {
      this.router.navigate([this.item.route]);
    }
  }

  private readonly iconMap: Record<string, string> = {
    users: 'group',
    pin: 'location_on',
    brain: 'psychology',
    alert: 'warning',
    leaf: 'eco',
    trend: 'trending_up',
    calendar: 'event',
    training: 'school',
    cloud: 'cloud',
    flag: 'flag',
    iot: 'sensors',
    speed: 'speed'
  };

  getIcon(key?: string): string {
    if (!key) return 'circle';
    return this.iconMap[key] || key;
  }
}
