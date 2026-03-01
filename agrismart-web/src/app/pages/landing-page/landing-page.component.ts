import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit {
  currentSlide = 0;

  slides = [
    {
      icon: 'monitoring',
      title: 'Real-Time Monitoring',
      description: 'Monitor soil humidity, temperature, air conditions and water levels using IoT sensors.'
    },
    {
      icon: 'psychology',
      title: 'AI Decision Support',
      description: 'Upload crop photos and receive instant AI-based disease diagnosis and recommendations.'
    },
    {
      icon: 'water_drop',
      title: 'Smart Irrigation',
      description: 'Automatic alerts and smart recommendations to optimize water consumption.'
    },
    {
      icon: 'shopping_cart',
      title: 'Agro Marketplace',
      description: 'Buy and sell agricultural products and inputs through an integrated marketplace.'
    },
    {
      icon: 'cloud_off',
      title: 'Offline Mode',
      description: 'System works even in rural areas with weak connectivity.'
    }
  ];

  features = [
    { icon: 'biotech', title: 'AI Crop Diagnosis', desc: 'Identify pests and diseases instantly using computer vision.' },
    { icon: 'dashboard_customize', title: 'Smart Sensors Dashboard', desc: 'Visualize your farm data in real-time with intuitive charts.' },
    { icon: 'forum', title: 'Technical Assistance Chat', desc: 'Connect with agricultural experts for personalized advice.' },
    { icon: 'trending_up', title: 'Market Price Tracking', desc: 'Stay updated with local and global agricultural market trends.' },
    { icon: 'play_circle', title: 'Agricultural Training Videos', desc: 'Access a library of curated training content for better yields.' },
    { icon: 'groups', title: 'Cooperative Management Tools', desc: 'Simplified tools for managing cooperative members and resources.' }
  ];

  steps = [
    { title: 'Install Sensors', desc: 'Deploy IoT sensors across your farm fields.' },
    { title: 'Data Collected via IoT', desc: 'Sensors gather precise environmental data.' },
    { title: 'Data Sent to Cloud', desc: 'Secure transmission to our AI cloud servers.' },
    { title: 'AI Analysis', desc: 'Deep learning models process your farm data.' },
    { title: 'Smart Recommendations', desc: 'Receive actionable insights on your device.' }
  ];

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    // Auto-redirect if already logged in (session persistence)
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        if (user.requiresPasswordChange) {
          this.router.navigate(['/set-new-password']);
          return;
        }

        const normalizedRole = user.role.trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
      }
    }
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToMarket() {
    this.router.navigate(['/marketplace']);
  }
}
