import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Training {
    id: number;
    title: string;
    category: string;
    duration: string;
    matchCriteria: string[]; // Keywords to match with member needs
}

interface Member {
    id: number;
    name: string;
    role: string;
    needs: string[];
    lastActivity: string;
    matchScore?: number;
    isRecommended?: boolean;
}

interface SmartGroup {
    name: string;
    description: string;
    members: Member[];
}

@Component({
    selector: 'app-recommendations',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './recommendations.component.html',
    styleUrl: './recommendations.component.scss'
})
export class RecommendationsComponent implements OnInit {
    trainings: Training[] = [
        { id: 1, title: 'Optimisation de l\'irrigation', category: 'Technique', duration: '4h', matchCriteria: ['irrigation', 'eau', 'stress hydrique'] },
        { id: 2, title: 'Gestion durable des sols', category: 'Environnement', duration: '6h', matchCriteria: ['sol', 'fertilité', 'érosion'] },
        { id: 3, title: 'Exportation & Normes EU', category: 'Business', duration: '8h', matchCriteria: ['export', 'qualité', 'normes'] },
        { id: 4, title: 'Diagnostic IA des maladies', category: 'Innovation', duration: '3h', matchCriteria: ['ia', 'maladies', 'santé'] }
    ];

    smartGroups: SmartGroup[] = [
        {
            name: 'Besoins Critiques',
            description: 'Membres avec des zones de stress détectées',
            members: [
                { id: 1, name: 'Jean Dupont', role: 'Producteur', needs: ['irrigation', 'eau'], lastActivity: '2j' },
                { id: 2, name: 'Aicha Benali', role: 'Producteur', needs: ['ia', 'maladies'], lastActivity: '1j' }
            ]
        },
        {
            name: 'Nouveaux Adhérents',
            description: 'Membres inscrits le mois dernier',
            members: [
                { id: 3, name: 'Lucas Meyer', role: 'Technicien', needs: ['normes', 'export'], lastActivity: '5j' },
                { id: 4, name: 'Marie Curie', role: 'Producteur', needs: ['sol', 'fertilité'], lastActivity: '3j' }
            ]
        },
        {
            name: 'Experts en Progression',
            description: 'Candidats pour des certifications avancées',
            members: [
                { id: 5, name: 'Pierre Gasly', role: 'Producteur', needs: ['innovation', 'ia'], lastActivity: '12h' }
            ]
        }
    ];

    selectedTraining: Training | null = null;
    isSending = false;
    searchQuery = '';

    ngOnInit() {
        // Initial display
    }

    selectTraining(training: Training) {
        this.selectedTraining = training;
        this.applySmartMatch(training);
    }

    applySmartMatch(training: Training) {
        this.smartGroups.forEach(group => {
            group.members.forEach(member => {
                const matchingNeeds = member.needs.filter(need =>
                    training.matchCriteria.some(criteria => criteria.includes(need) || need.includes(criteria))
                );

                member.matchScore = Math.floor((matchingNeeds.length / training.matchCriteria.length) * 100) + 20;
                if (member.matchScore > 100) member.matchScore = 95;
                member.isRecommended = member.matchScore > 40;
            });
        });
    }

    recommendToMember(member: Member) {
        console.log(`Recommending ${this.selectedTraining?.title} to ${member.name}`);
        // Show a small feedback
    }

    propagateToGroup(group: SmartGroup) {
        this.isSending = true;
        setTimeout(() => {
            console.log(`Propagating ${this.selectedTraining?.title} to group ${group.name}`);
            this.isSending = false;
        }, 1500);
    }

    autoMatch() {
        if (!this.trainings.length) return;
        const randomTraining = this.trainings[Math.floor(Math.random() * this.trainings.length)];
        this.selectTraining(randomTraining);
    }
}
