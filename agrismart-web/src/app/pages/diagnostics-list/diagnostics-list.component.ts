import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-diagnostics-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './diagnostics-list.component.html',
  styleUrl: './diagnostics-list.component.scss'
})
export class DiagnosticsListComponent {

  constructor(private router: Router) {}

  // ==============================
  // Données filtres
  // ==============================

  searchText: string = '';
  selectedCulture: string = 'all';
  selectedStatut: string = 'all';
  selectedDate: string = '';

  cultures = [
    { label: 'Toutes les cultures', value: 'all' },
    { label: 'Tomate', value: 'Tomate' },
    { label: 'Pomme de terre', value: 'Pomme de terre' },
    { label: 'Blé', value: 'Blé' }
  ];

  statuts = [
    { label: 'Tous les statuts', value: 'all' },
    { label: 'Validé', value: 'Validé' },
    { label: 'En attente', value: 'En attente' },
    { label: 'Rejeté', value: 'Rejeté' }
  ];

  // ==============================
  // Données Diagnostics (Mock)
  // ==============================

  diagnostics = [
    {
      id: '1',
      culture: 'Tomate',
      maladie: 'Mildiou',
      confiance: 85,
      statut: 'Validé',
      date: new Date('2026-02-20'),
      image: 'https://via.placeholder.com/300x200'
    },
    {
      id: '2',
      culture: 'Pomme de terre',
      maladie: 'Alternariose',
      confiance: 72,
      statut: 'En attente',
      date: new Date('2026-02-18'),
      image: 'https://via.placeholder.com/300x200'
    }
  ];

  filteredDiagnostics = [...this.diagnostics];

  // ==============================
  // Navigation
  // ==============================

  goToDashboard(): void {
    this.router.navigate(['/app/dashboard-ia']);
  }

  viewDetail(id: string): void {
    // No dedicated detail route yet — navigate to dashboard (could be changed to a detail route later)
    this.router.navigate(['/app/dashboard-ia']);
  }

  // ==============================
  // Filtres
  // ==============================

  onSearch(): void {
    this.applyFilters();
  }

  onCultureChange(): void {
    this.applyFilters();
  }

  onStatutChange(): void {
    this.applyFilters();
  }

  onDateChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredDiagnostics = this.diagnostics.filter(d => {

      const matchSearch =
        d.culture.toLowerCase().includes(this.searchText.toLowerCase()) ||
        d.maladie.toLowerCase().includes(this.searchText.toLowerCase());

      const matchCulture =
        this.selectedCulture === 'all' ||
        d.culture === this.selectedCulture;

      const matchStatut =
        this.selectedStatut === 'all' ||
        d.statut === this.selectedStatut;

      const matchDate =
        !this.selectedDate ||
        this.formatDate(d.date).includes(this.selectedDate);

      return matchSearch && matchCulture && matchStatut && matchDate;
    });
  }

  // ==============================
  // Helpers UI
  // ==============================

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'Validé':
        return 'status-valid';
      case 'En attente':
        return 'status-pending';
      case 'Rejeté':
        return 'status-rejected';
      default:
        return '';
    }
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 80) return 'confidence-high';
    if (confidence >= 50) return 'confidence-medium';
    return 'confidence-low';
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

}
