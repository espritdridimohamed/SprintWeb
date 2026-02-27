/*import { Component } from '@angular/core';

@Component({
  selector: 'app-ticket-conversation',
  standalone: true,
  imports: [],
  templateUrl: './ticket-conversation.component.html',
  styleUrl: './ticket-conversation.component.scss'
})
export class TicketConversationComponent {

}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Message {
  id: string;
  sender: 'client' | 'technicien';
  senderName: string;
  content: string;
  image?: string;
  timestamp: Date;
}

interface Ticket {
  id: string;
  client: string;
  parcelle: string;
  sujet: string;
  statut: 'en-attente' | 'en-cours' | 'resolu';
  urgence: 'élevée' | 'moyenne' | 'faible';
}

@Component({
  selector: 'app-ticket-conversation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ticket-conversation.component.html',
  styleUrls: ['./ticket-conversation.component.scss']
})
export class TicketConversationComponent implements OnInit {
  ticketId: string = '';
  newMessage: string = '';
  selectedFile: File | null = null;

  ticket: Ticket = {
    id: '1',
    client: 'Mohamed Alami',
    parcelle: 'P-042',
    sujet: 'Problème d\'irrigation parcelle Nord',
    statut: 'en-attente',
    urgence: 'élevée'
  };

  messages: Message[] = [
    {
      id: '1',
      sender: 'client',
      senderName: 'Mohamed Alami',
      content: 'Bonjour, j\'ai un problème avec mon système d\'irrigation. La pompe ne démarre plus depuis ce matin.',
      timestamp: new Date('2026-02-27T10:23:00')
    },
    {
      id: '2',
      sender: 'client',
      senderName: 'Mohamed Alami',
      content: '',
      image: 'assets/images/irrigation-problem.jpg',
      timestamp: new Date('2026-02-27T10:24:00')
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get ticket ID from route
    this.ticketId = this.route.snapshot.params['id'] || '1';
    
    // Load ticket data (from API in production)
    this.loadTicketData();
  }

  loadTicketData(): void {
    // TODO: Load from API
    // For now, using mock data based on ticketId
  }

  // Send new message
  sendMessage(): void {
    if (!this.newMessage.trim() && !this.selectedFile) {
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      sender: 'technicien',
      senderName: 'Support AgriSmart',
      content: this.newMessage,
      timestamp: new Date()
    };

    if (this.selectedFile) {
      // Handle file upload
      // TODO: Upload file to server and get URL
      message.image = URL.createObjectURL(this.selectedFile);
    }

    this.messages.push(message);
    this.newMessage = '';
    this.selectedFile = null;

    // Scroll to bottom
    setTimeout(() => this.scrollToBottom(), 100);
  }

  // Handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  // Trigger file input click
  triggerFileInput(): void {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput?.click();
  }

  // Change ticket status
  changeStatus(newStatus: 'en-attente' | 'en-cours' | 'resolu'): void {
    this.ticket.statut = newStatus;
    // TODO: Update on server
    console.log('Status changed to:', newStatus);
  }

  // Get status label
  getStatusLabel(): string {
    const labels: { [key: string]: string } = {
      'en-attente': 'En attente',
      'en-cours': 'En cours',
      'resolu': 'Résolu'
    };
    return labels[this.ticket.statut] || this.ticket.statut;
  }

  // Get urgency label
  getUrgenceLabel(): string {
    return `Urgence: ${this.ticket.urgence.charAt(0).toUpperCase() + this.ticket.urgence.slice(1)}`;
  }

  // Format timestamp
  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Scroll to bottom of messages
  scrollToBottom(): void {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Go back to tickets list
  goBack(): void {
    this.router.navigate(['/app/support']);
  }

  // Handle Enter key
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
