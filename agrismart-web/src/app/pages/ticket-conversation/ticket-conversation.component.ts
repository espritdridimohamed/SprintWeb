import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Message {
    id: string;
    sender: 'client' | 'technicien';
    senderName: string;
    content?: string;
    image?: string;
    timestamp: Date;
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

    ticket = {
        id: '1',
        client: 'Jean Dupont',
        parcelle: 'Zone Nord - P3',
        urgence: 'elevee',
        statut: 'en-attente'
    };

    messages: Message[] = [
        {
            id: '1',
            sender: 'client',
            senderName: 'Jean Dupont',
            content: 'Bonjour, mon capteur d\'humidité ne semble pas envoyer de données depuis ce matin.',
            timestamp: new Date(Date.now() - 7200000)
        },
        {
            id: '2',
            sender: 'technicien',
            senderName: 'Support AgriSmart',
            content: 'Bonjour Monsieur Dupont. Je regarde cela tout de suite. Pouvez-vous vérifier si la LED du boîtier clignote ?',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: '3',
            sender: 'client',
            senderName: 'Jean Dupont',
            content: 'Voici une photo du boîtier actuellement.',
            image: 'https://via.placeholder.com/800x600',
            timestamp: new Date(Date.now() - 1800000)
        }
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.ticketId = this.route.snapshot.paramMap.get('id') || '';
        // Simuler le chargement du ticket
    }

    goBack(): void {
        this.router.navigate(['/app/support']);
    }

    getUrgenceLabel(): string {
        switch (this.ticket.urgence) {
            case 'elevee': return 'Urgence Élevée';
            case 'moyenne': return 'Urgence Moyenne';
            case 'faible': return 'Urgence Faible';
            default: return 'Urgence normale';
        }
    }

    formatTime(date: Date): string {
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    changeStatus(newStatus: string): void {
        console.log('Nouveau statut:', newStatus);
        // Simuler l'enregistrement
    }

    triggerFileInput(): void {
        document.getElementById('file-input')?.click();
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.selectedFile = file;
        }
    }

    onKeyPress(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage(): void {
        if (!this.newMessage.trim() && !this.selectedFile) return;

        const message: Message = {
            id: Date.now().toString(),
            sender: 'technicien',
            senderName: 'Support AgriSmart',
            content: this.newMessage.trim() || undefined,
            timestamp: new Date()
        };

        if (this.selectedFile) {
            // Simuler l'upload d'image
            message.image = URL.createObjectURL(this.selectedFile);
        }

        this.messages.push(message);
        this.newMessage = '';
        this.selectedFile = null;

        // Scroll to bottom
        setTimeout(() => {
            const container = document.querySelector('.messages-container');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }, 100);
    }
}
