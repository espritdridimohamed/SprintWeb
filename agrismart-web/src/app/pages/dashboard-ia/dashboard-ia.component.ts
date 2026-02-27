/*import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // pour *ngIf, *ngFor
import { RouterModule } from '@angular/router'; // pour routerLink


@Component({
  selector: 'app-dashboard-ia',
  standalone: true,
  imports: [CommonModule, RouterModule], // <-- ici
  templateUrl: './dashboard-ia.component.html',
  styleUrl: './dashboard-ia.component.scss'
})
export class DashboardIaComponent {

}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface DiagnosticRecent {
  id: string;
  culture: string;
  maladie: string;
  confiance: number;
  statut: 'Confirmé' | 'À vérifier';
}

interface Recommendation {
  id: string;
  titre: string;
  parcelle: string;
  urgence: 'Élevée' | 'Moyenne' | 'Faible';
}

interface Stats {
  totalDiagnostics: number;
  tauxPrecision: number;
  aujourdhui: number;
  aVerifier: number;
}

@Component({
  selector: 'app-dashboard-ia',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-ia.component.html',
  styleUrls: ['./dashboard-ia.component.scss']
})
export class DashboardIaComponent implements OnInit {
  
  stats: Stats = {
    totalDiagnostics: 234,
    tauxPrecision: 91,
    aujourdhui: 23,
    aVerifier: 5
  };

  diagnosticsRecents: DiagnosticRecent[] = [
    {
      id: '1',
      culture: 'Tomate',
      maladie: 'Mildiou',
      confiance: 94,
      statut: 'Confirmé'
    },
    {
      id: '2',
      culture: 'Pomme de terre',
      maladie: 'Alternariose',
      confiance: 87,
      statut: 'Confirmé'
    },
    {
      id: '3',
      culture: 'Blé',
      maladie: 'Rouille jaune',
      confiance: 72,
      statut: 'À vérifier'
    }
  ];

  recommendations: Recommendation[] = [
    {
      id: '1',
      titre: 'Traiter parcelle contre le mildiou',
      parcelle: 'P-042',
      urgence: 'Élevée'
    },
    {
      id: '2',
      titre: 'Analyse sol recommandée',
      parcelle: 'P-128',
      urgence: 'Moyenne'
    },
    {
      id: '3',
      titre: 'Vérifier système irrigation',
      parcelle: 'P-056',
      urgence: 'Faible'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  // Navigate to diagnostics list
  goToDiagnostics(): void {
    this.router.navigate(['/app/diagnostics']);
  }

  // Navigate to diagnostic detail
  viewDiagnosticDetail(id: string): void {
    // No dedicated detail route exists yet — navigate to diagnostics list for now
    this.router.navigate(['/app/diagnostics']);
  }

  // Navigate to new diagnostic
  createNewDiagnostic(): void {
    this.router.navigate(['/app/diagnostics']);
  }

  // Get confidence class
  getConfidenceClass(confiance: number): string {
    if (confiance >= 85) return 'high';
    if (confiance >= 70) return 'medium';
    return 'low';
  }

  // Get urgence class
  getUrgenceClass(urgence: string): string {
    return urgence.toLowerCase();
  }

  // Get statut class
  getStatutClass(statut: string): string {
    return statut === 'Confirmé' ? 'confirme' : 'a-verifier';
  }
}
