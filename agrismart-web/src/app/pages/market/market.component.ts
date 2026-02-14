import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Offer {
  id: number;
  product: string;
  quantity: number;
  unit: string;
  price: number;
  quality: string;
  availability: string;
  status: 'pending' | 'validated' | 'sold';
  producer?: string;
  date: Date;
}

interface PriceData {
  product: string;
  region: string;
  currentPrice: number;
  previousPrice: number;
  trend: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  date: Date;
}

interface GroupedOffer {
  id: number;
  name: string;
  producers: number;
  totalQuantity: number;
  status: string;
}

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './market.component.html',
  styleUrl: './market.component.scss'
})
export class MarketComponent implements OnInit {
  // User role simulation - in real app, this would come from auth service
  userRole: 'producteur' | 'cooperative' | 'admin' | 'viewer' = 'producteur';

  // Expose Math to template
  Math = Math;

  // Modal states
  showOfferModal = false;
  showGroupedOfferModal = false;
  showPriceAlertModal = false;

  // Form data
  newOffer: Partial<Offer> = {
    product: '',
    quantity: 0,
    unit: 'kg',
    price: 0,
    quality: 'standard',
    availability: 'immediate'
  };

  priceAlert = {
    product: '',
    threshold: 0,
    type: 'above'
  };

  // Data
  offers: Offer[] = [];
  myOffers: Offer[] = [];
  priceData: PriceData[] = [];
  transactions: Transaction[] = [];
  groupedOffers: GroupedOffer[] = [];
  priceAlerts: any[] = [];

  // Statistics
  stats = {
    activeOffers: 68,
    groupedTransactions: 24,
    priceIndex: 6.4,
    totalVolume: 1250,
    totalRevenue: 45600,
    averageMargin: 18.5
  };

  // Filters
  selectedProduct = 'all';
  selectedRegion = 'all';

  products = ['Tomates', 'Blé', 'Olives', 'Pommes de terre', 'Agrumes'];
  regions = ['Nord', 'Centre', 'Sud', 'Est', 'Ouest'];

  ngOnInit() {
    this.loadMockData();
  }

  loadMockData() {
    // Mock offers
    this.offers = [
      { id: 1, product: 'Tomates', quantity: 500, unit: 'kg', price: 2.5, quality: 'Bio', availability: 'immediate', status: 'validated', producer: 'Ferme Martin', date: new Date() },
      { id: 2, product: 'Blé', quantity: 1000, unit: 'kg', price: 0.8, quality: 'Standard', availability: '1 semaine', status: 'pending', producer: 'Coop Nord', date: new Date() },
      { id: 3, product: 'Olives', quantity: 300, unit: 'kg', price: 4.2, quality: 'Premium', availability: 'immediate', status: 'validated', producer: 'Domaine Sud', date: new Date() },
      { id: 4, product: 'Pommes de terre', quantity: 800, unit: 'kg', price: 1.2, quality: 'Standard', availability: '3 jours', status: 'sold', producer: 'Ferme Dupont', date: new Date() }
    ];

    // Mock my offers (for producteur)
    this.myOffers = [
      { id: 5, product: 'Tomates', quantity: 200, unit: 'kg', price: 2.8, quality: 'Bio', availability: 'immediate', status: 'validated', date: new Date() },
      { id: 6, product: 'Agrumes', quantity: 150, unit: 'kg', price: 3.5, quality: 'Premium', availability: 'immediate', status: 'pending', date: new Date() }
    ];

    // Mock price data
    this.priceData = [
      { product: 'Tomates', region: 'Nord', currentPrice: 2.5, previousPrice: 2.3, trend: 8.7 },
      { product: 'Blé', region: 'Centre', currentPrice: 0.8, previousPrice: 0.77, trend: 3.9 },
      { product: 'Olives', region: 'Sud', currentPrice: 4.2, previousPrice: 4.3, trend: -2.3 },
      { product: 'Pommes de terre', region: 'Nord', currentPrice: 1.2, previousPrice: 1.15, trend: 4.3 },
      { product: 'Agrumes', region: 'Est', currentPrice: 3.5, previousPrice: 3.2, trend: 9.4 }
    ];

    // Mock grouped offers (for cooperative)
    this.groupedOffers = [
      { id: 1, name: 'Pack semences printemps', producers: 4, totalQuantity: 2500, status: 'En négociation' },
      { id: 2, name: 'Fertilisants bio', producers: 2, totalQuantity: 1200, status: 'Validé' },
      { id: 3, name: 'Irrigation goutte à goutte', producers: 3, totalQuantity: 800, status: 'En attente' }
    ];

    // Mock transactions (for cooperative)
    this.transactions = [
      { id: 1, type: 'Vente groupée - Tomates', amount: 12500, status: 'Complétée', date: new Date('2026-02-10') },
      { id: 2, type: 'Vente groupée - Blé', amount: 8900, status: 'En cours', date: new Date('2026-02-12') },
      { id: 3, type: 'Vente groupée - Olives', amount: 15600, status: 'Complétée', date: new Date('2026-02-08') }
    ];

    // Mock price alerts
    this.priceAlerts = [
      { product: 'Tomates', threshold: 3.0, type: 'above', active: true },
      { product: 'Blé', threshold: 0.7, type: 'below', active: true }
    ];
  }

  // Modal methods
  openOfferModal() {
    this.showOfferModal = true;
  }

  closeOfferModal() {
    this.showOfferModal = false;
    this.resetOfferForm();
  }

  openGroupedOfferModal() {
    this.showGroupedOfferModal = true;
  }

  closeGroupedOfferModal() {
    this.showGroupedOfferModal = false;
  }

  openPriceAlertModal() {
    this.showPriceAlertModal = true;
  }

  closePriceAlertModal() {
    this.showPriceAlertModal = false;
  }

  // Offer methods
  submitOffer() {
    const offer: Offer = {
      id: this.offers.length + 1,
      product: this.newOffer.product || '',
      quantity: this.newOffer.quantity || 0,
      unit: this.newOffer.unit || 'kg',
      price: this.newOffer.price || 0,
      quality: this.newOffer.quality || 'standard',
      availability: this.newOffer.availability || 'immediate',
      status: 'pending',
      date: new Date()
    };

    this.myOffers.unshift(offer);
    this.offers.unshift(offer);
    this.closeOfferModal();
  }

  resetOfferForm() {
    this.newOffer = {
      product: '',
      quantity: 0,
      unit: 'kg',
      price: 0,
      quality: 'standard',
      availability: 'immediate'
    };
  }

  // Price alert methods
  submitPriceAlert() {
    this.priceAlerts.push({
      product: this.priceAlert.product,
      threshold: this.priceAlert.threshold,
      type: this.priceAlert.type,
      active: true
    });
    this.closePriceAlertModal();
  }

  // Utility methods
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'status-pending',
      'validated': 'status-validated',
      'sold': 'status-sold',
      'En attente': 'status-pending',
      'En négociation': 'status-negotiation',
      'Validé': 'status-validated',
      'Complétée': 'status-completed',
      'En cours': 'status-progress'
    };
    return statusMap[status] || '';
  }

  getTrendClass(trend: number): string {
    return trend >= 0 ? 'trend-up' : 'trend-down';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
  }

  // Role switching (for demo purposes)
  switchRole(role: 'producteur' | 'cooperative' | 'admin' | 'viewer') {
    this.userRole = role;
  }

  get filteredPriceData(): PriceData[] {
    return this.priceData.filter(data => {
      const productMatch = this.selectedProduct === 'all' || data.product === this.selectedProduct;
      const regionMatch = this.selectedRegion === 'all' || data.region === this.selectedRegion;
      return productMatch && regionMatch;
    });
  }
}
