/*import { Component } from '@angular/core';

@Component({
  selector: 'app-modeles-ia',
  standalone: true,
  imports: [],
  templateUrl: './modeles-ia.component.html',
  styleUrl: './modeles-ia.component.scss'
})
export class ModelesIaComponent {

}
*/
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PerformanceStats {
  precision: number;
  totalDiagnostics: number;
  avgTime: number;
}

interface TrainingInfo {
  lastTraining: Date;
  imagesCount: number;
  classesCount: number;
  nextTraining: Date;
}

interface PrecisionDataPoint {
  month: string;
  value: number;
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modeles-ia.component.html',
  styleUrl: './modeles-ia.component.scss'
})
export class ModelesIaComponent implements OnInit {
  // Model Configuration
  selectedModel = 'AgriSmart AI v3.2.1 (Production)';
  isModelActive = true;
  
  modelVersions = [
    'AgriSmart AI v3.2.1 (Production)',
    'AgriSmart AI v3.1.5 (Stable)',
    'AgriSmart AI v3.0.0 (Legacy)',
    'AgriSmart AI v4.0.0-beta (Test)'
  ];

  // Confidence Threshold
  confidenceThreshold = 85;
  minThreshold = 50;
  maxThreshold = 100;

  // Performance Statistics
  performanceStats: PerformanceStats = {
    precision: 91,
    totalDiagnostics: 2847,
    avgTime: 1.2
  };

  // Training Information
  trainingInfo: TrainingInfo = {
    lastTraining: new Date('2026-02-08'),
    imagesCount: 45287,
    classesCount: 28,
    nextTraining: new Date('2026-02-22')
  };

  // Precision Evolution Data
  precisionData: PrecisionDataPoint[] = [
    { month: 'Sep', value: 85 },
    { month: 'Oct', value: 87 },
    { month: 'Nov', value: 89 },
    { month: 'Déc', value: 88 },
    { month: 'Jan', value: 90 },
    { month: 'Fév', value: 92 }
  ];

  // UI State
  showSaveConfirmation = false;
  isSaving = false;

  ngOnInit(): void {
    // Initialize component
  }

  // Model Management
  onModelChange(): void {
    console.log('Model changed to:', this.selectedModel);
  }

  toggleModelState(): void {
    this.isModelActive = !this.isModelActive;
    console.log('Model active state:', this.isModelActive);
  }

  // Confidence Threshold
  onThresholdChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.confidenceThreshold = parseInt(target.value);
  }

  getThresholdWarningClass(): string {
    if (this.confidenceThreshold < 70) return 'danger';
    if (this.confidenceThreshold < 85) return 'warning';
    return 'safe';
  }

  // Chart Methods
  getChartPoints(): string {
    const width = 100;
    const height = 100;
    const padding = 10;
    
    const values = this.precisionData.map(d => d.value);
    const min = Math.min(...values) - 5;
    const max = Math.max(...values) + 5;
    const range = max - min;
    
    const points = this.precisionData.map((point, index) => {
      const x = (index / (this.precisionData.length - 1)) * width;
      const normalizedValue = (point.value - min) / range;
      const y = height - padding - (normalizedValue * (height - 2 * padding));
      return `${x},${y}`;
    });
    
    return points.join(' ');
  }

  getChartArea(): string {
    const points = this.getChartPoints();
    return `${points} 100,100 0,100`;
  }

  // Save Configuration
  async saveConfiguration(): Promise<void> {
    this.isSaving = true;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    this.isSaving = false;
    this.showSaveConfirmation = true;
    
    // Hide confirmation after 3 seconds
    setTimeout(() => {
      this.showSaveConfirmation = false;
    }, 3000);
    
    console.log('Configuration saved:', {
      model: this.selectedModel,
      isActive: this.isModelActive,
      threshold: this.confidenceThreshold
    });
  }

  cancelChanges(): void {
    // Reset to default values or reload from server
    this.confidenceThreshold = 85;
    console.log('Changes cancelled');
  }

  // Utility Methods
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  getPerformanceClass(value: number, type: 'precision' | 'time'): string {
    if (type === 'precision') {
      if (value >= 90) return 'excellent';
      if (value >= 80) return 'good';
      return 'average';
    } else {
      if (value <= 1.5) return 'excellent';
      if (value <= 3) return 'good';
      return 'average';
    }
  }
}
