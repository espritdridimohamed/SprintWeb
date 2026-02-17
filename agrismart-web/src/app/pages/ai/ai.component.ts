/*
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss'
})
export class AiComponent {

  diagnostic = {
    id: 'DIA-001',
    culture: 'Tomate',
    parcelle: 'A-12',
    date: '15/02/2026',
    prediction: 'Mildiou détecté',
    confidence: 94,
    status: 'À vérifier',
    recommendation: 'Appliquer fongicide cuivre'
  };

  commentaireTechnicien = '';

  valider() {
    this.diagnostic.status = 'Confirmé';
    console.log('Diagnostic validé');
  }

  corriger() {
    this.diagnostic.status = 'Corrigé';
    console.log('Diagnostic corrigé');
  }
}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SensorData {
  name: string;
  icon: string;
  data: number[];
  labels: string[];
  color: string;
  unit: string;
  currentValue?: number;
}

interface Reason {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-diagnostic-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai.component.html',
  styleUrls: ['./ai.component.scss']
})
export class AiComponent implements OnInit {
  diagnosticScore = 94;
  diagnosticType = 'Mildiou';
  plantCulture = 'Tomate';
  diagnosticDate = new Date(); // ou la date réelle du diagnostic
  isConfirmed = true; // si confirmé = true, sinon false
  plantImageUrl = 'assets/images/tomato-plant.jpg';

  
  reasons: Reason[] = [
    {
      icon: '💧',
      text: 'Humidité élevée détectée (45% en moyenne) favorisant le développement fongique'
    },
    {
      icon: '🌡️',
      text: 'Température nocturne fraîche (16-18°C) propice au mildiou'
    },
    {
      icon: '🌧️',
      text: 'Précipitations récentes augmentant le risque d\'infection'
    },
    {
      icon: '🔍',
      text: 'Analyse d\'image confirmant les symptômes caractéristiques (taches brunes)'
    }
  ];

  recommendations: string[] = [
    'Appliquer un fongicide à base de cuivre dans les 48h',
    'Améliorer la ventilation entre les plants',
    'Éviter l\'arrosage par aspersion',
    'Surveiller l\'évolution dans les 7 prochains jours'
  ];

  sensorData: SensorData[] = [
    {
      name: 'Humidité du sol',
      icon: '💧',
      data: [30, 35, 42, 48, 52, 55, 54, 52, 48, 45, 42, 38],
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      color: '#3B82F6',
      unit: '%',
      currentValue: 45
    },
    {
      name: 'Température',
      icon: '🌡️',
      data: [14, 13, 13, 14, 16, 19, 23, 26, 28, 27, 24, 20],
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      color: '#EF4444',
      unit: '°C',
      currentValue: 22
    },
    {
      name: 'Pluviométrie',
      icon: '🌧️',
      data: [0, 0, 1, 3, 6, 9, 12, 10, 6, 3, 1, 0],
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      color: '#8B5CF6',
      unit: 'mm',
      currentValue: 8
    }
  ];

  ngOnInit(): void {
    this.initializeAnimations();
  }

  initializeAnimations(): void {
    // Animations will be handled by CSS
  }

  getScoreColor(): string {
    if (this.diagnosticScore >= 80) return '#10B981';
    if (this.diagnosticScore >= 60) return '#F59E0B';
    return '#EF4444';
  }

  getScoreClass(): string {
    if (this.diagnosticScore >= 80) return 'high';
    if (this.diagnosticScore >= 60) return 'medium';
    return 'low';
  }

  saveRecommendations(): void {
    console.log('Enregistrement des recommandations...');
    // TODO: Implement API call
  }

  getChartPoints(data: number[]): string {
    const width = 100;
    const height = 100;
    const padding = 5;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const normalizedValue = (value - min) / range;
      const y = height - padding - (normalizedValue * (height - 2 * padding));
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }

  getChartArea(data: number[]): string {
    const points = this.getChartPoints(data);
    const width = 100;
    const height = 100;
    
    return `${points} ${width},${height} 0,${height}`;
  }

  getDisplayLabels(): string[] {
    return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
  }

  validateDiagnostic(): void {
  // Pour le moment, on ne fait rien
  console.log('Bouton Valider cliqué');
}

correctDiagnostic(): void {
  // Pour le moment, on ne fait rien
  console.log('Bouton Corriger cliqué');
}

}
