import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() roleLabel = '';
  @Input() orgLabel = '';
  @Input() showELearning = false;

  constructor(private router: Router) { }

  goToELearning() {
    this.router.navigate(['/app/e-learning']);
  }
}
