/*import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
})
export class SupportComponent {}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Ticket {
  id: string;
  client: string;
  parcelle: string;
  sujet: string;
  statut: 'en-attente' | 'en-cours' | 'resolu';
  urgence: 'élevée' | 'moyenne' | 'faible';
  messagesCount: number;
  lastActivity: string;
}

@Component({
  selector: 'app-support-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss'
})
export class SupportTicketsComponent implements OnInit {
  
  tickets: Ticket[] = [
    {
      id: '1',
      client: 'Mohamed Alami',
      parcelle: 'P-042',
      sujet: 'Problème d\'irrigation parcelle Nord',
      statut: 'en-attente',
      urgence: 'élevée',
      messagesCount: 3,
      lastActivity: 'Il y a 2h'
    },
    {
      id: '2',
      client: 'Fatima Zahra',
      parcelle: 'P-128',
      sujet: 'Conseil sur rotation des cultures',
      statut: 'en-attente',
      urgence: 'moyenne',
      messagesCount: 1,
      lastActivity: 'Il y a 5h'
    },
    {
      id: '3',
      client: 'Hassan Benjelloun',
      parcelle: 'P-091',
      sujet: 'Paramétrage système goutte-à-goutte',
      statut: 'en-attente',
      urgence: 'faible',
      messagesCount: 2,
      lastActivity: 'Il y a 1j'
    },
    {
      id: '4',
      client: 'Rachid Tazi',
      parcelle: 'P-056',
      sujet: 'Installation capteurs météo',
      statut: 'en-cours',
      urgence: 'élevée',
      messagesCount: 7,
      lastActivity: 'Il y a 3h'
    },
    {
      id: '5',
      client: 'Samira El Amrani',
      parcelle: 'P-203',
      sujet: 'Calibration pH-mètre',
      statut: 'en-cours',
      urgence: 'moyenne',
      messagesCount: 4,
      lastActivity: 'Il y a 6h'
    },
    {
      id: '6',
      client: 'Karim Fassi',
      parcelle: 'P-175',
      sujet: 'Configuration tableau de bord',
      statut: 'resolu',
      urgence: 'faible',
      messagesCount: 5,
      lastActivity: 'Il y a 2j'
    },
    {
      id: '7',
      client: 'Nadia Berrada',
      parcelle: 'P-089',
      sujet: 'Formation utilisation IA',
      statut: 'resolu',
      urgence: 'moyenne',
      messagesCount: 8,
      lastActivity: 'Il y a 3j'
    },
    {
      id: '8',
      client: 'Omar Chraibi',
      parcelle: 'P-147',
      sujet: 'Problème connexion capteurs',
      statut: 'resolu',
      urgence: 'élevée',
      messagesCount: 12,
      lastActivity: 'Il y a 4j'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  // Filter tickets by status
  getTicketsByStatus(statut: 'en-attente' | 'en-cours' | 'resolu'): Ticket[] {
    return this.tickets.filter(ticket => ticket.statut === statut);
  }

  // Get count by status
  getCountByStatus(statut: 'en-attente' | 'en-cours' | 'resolu'): number {
    return this.getTicketsByStatus(statut).length;
  }

  // Get status label
  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'en-attente': 'En attente',
      'en-cours': 'En cours',
      'resolu': 'Résolu'
    };
    return labels[statut] || statut;
  }

  // Get status color
  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'en-attente': '#FCD34D',
      'en-cours': '#3B82F6',
      'resolu': '#10B981'
    };
    return colors[statut] || '#999';
  }

  // Get urgency class
  getUrgenceClass(urgence: string): string {
    return urgence.toLowerCase().replace('é', 'e');
  }

  // Open ticket conversation
  openTicket(ticket: Ticket): void {
    this.router.navigate(['/app/support/ticket', ticket.id]); 
 }
}
