import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelItem } from '../../models/role.model';

@Component({
  selector: 'app-section-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-card.component.html',
  styleUrl: './section-card.component.scss'
})
export class SectionCardComponent {
  @Input() panel!: PanelItem;
}
