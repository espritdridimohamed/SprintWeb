import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Ticket {
  id: string;
  client: string;
  parcelle: string;
  sujet: string;
  urgence: 'faible' | 'moyenne' | 'elevee';
  statut: 'en-attente' | 'en-cours' | 'resolu';
  messagesCount: number;
  lastActivity: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent {
  tickets: Ticket[] = [
    {
      id: '1',
      client: 'Jean Dupont',
      parcelle: 'Zone Nord - P3',
      sujet: 'Capteur d\'humidité ne répond plus',
      urgence: 'elevee',
      statut: 'en-attente',
      messagesCount: 3,
      lastActivity: 'Il y a 2h'
    },
    {
      id: '2',
      client: 'Marie Laurent',
      parcelle: 'Serre 12',
      sujet: 'Question sur le dosage d\'irrigation',
      urgence: 'moyenne',
      statut: 'en-cours',
      messagesCount: 5,
      lastActivity: 'Il y a 15m'
    },
    {
      id: '3',
      client: 'Pierre Martin',
      parcelle: 'Zone Sud - S2',
      sujet: 'Problème d\'accès au tableau de bord',
      urgence: 'faible',
      statut: 'resolu',
      messagesCount: 2,
      lastActivity: 'Hier'
    }
  ];

  constructor(private router: Router) { }

  getTicketsByStatus(status: 'en-attente' | 'en-cours' | 'resolu'): Ticket[] {
    return this.tickets.filter(t => t.statut === status);
  }

  getCountByStatus(status: 'en-attente' | 'en-cours' | 'resolu'): number {
    return this.getTicketsByStatus(status).length;
  }

  getUrgenceClass(urgence: string): string {
    return urgence;
  }

  openTicket(ticket: Ticket): void {
    this.router.navigate(['/app/support/conversation', ticket.id]);
  }
}
