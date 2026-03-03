import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { RoleKey } from '../../models/role.model';
import { MarketService, Offer } from '../../services/market.service';

/*
interface Offer {
  id: string;
  product: string;
  quantity: number;
  unit: string;
  price: number;
  quality: string;
  availability: string;
  status: 'pending' | 'validated' | 'sold';
  producer?: string;
  ownerEmail?: string;
  date: Date;
}
*/

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
  // Expose Math to template
  Math = Math;
  isLoading = false;

  // Real role from JWT via RoleService
  get role(): RoleKey {
    return this.roleService.role;
  }

  // --- Permission helpers (role-based) ---
  get canCreateOffer(): boolean {
    return this.role === 'producteur';
  }

  get canValidateOffer(): boolean {
    return this.role === 'cooperative' || this.role === 'admin';
  }

  get canEditPrices(): boolean {
    return this.role === 'admin';
  }

  get canCreateGroupedOffer(): boolean {
    return this.role === 'cooperative' || this.role === 'admin';
  }

  get canViewTransactions(): boolean {
    return this.role === 'cooperative';
  }

  get isReadOnly(): boolean {
    return this.role === 'technicien' || this.role === 'ong' || this.role === 'etat' || this.role === 'viewer';
  }

  // Modal states
  showOfferModal = false;
  showGroupedOfferModal = false;
  showPriceAlertModal = false;
  showAdminAlertModal = false;

  // Edit mode
  isEditMode = false;
  editingOffer: Offer | null = null;

  selectedOfferForAlert: Offer | null = null;
  adminAlertMessage = '';
  adminAlertSuggestedPrice = 0;

  // Form data
  newOffer: Partial<Offer> = {
    product: '',
    quantity: 0,
    unit: 'kg',
    price: 0,
    quality: 'standard',
    availability: 'immediate',
    imageUrl: '',
    description: ''
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
  registeredImages: any[] = [];
  isUploading = false;

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

  constructor(
    private roleService: RoleService,
    private marketService: MarketService
  ) { }

  ngOnInit() {
    this.refreshData();
    this.loadImages();
  }

  refreshData() {
    this.isLoading = true;
    this.marketService.getAllOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        const currentUserEmail = JSON.parse(localStorage.getItem('agrismart_user') || '{}').email;
        this.myOffers = offers.filter(o => o.ownerEmail === currentUserEmail);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.marketService.getPrices().subscribe(prices => {
      this.priceData = prices;
    });

    // Ces données restent en dur tant que leurs controlleurs ne sont pas migrés
    this.groupedOffers = [
      { id: 1, name: 'Pack semences printemps', producers: 4, totalQuantity: 2500, status: 'En négociation' },
      { id: 2, name: 'Fertilisants bio', producers: 2, totalQuantity: 1200, status: 'Validé' },
      { id: 3, name: 'Irrigation goutte à goutte', producers: 3, totalQuantity: 800, status: 'En attente' }
    ];

    this.transactions = [
      { id: 1, type: 'Vente groupée - Tomates', amount: 12500, status: 'Complétée', date: new Date('2026-02-10') },
      { id: 2, type: 'Vente groupée - Blé', amount: 8900, status: 'En cours', date: new Date('2026-02-12') },
      { id: 3, type: 'Vente groupée - Olives', amount: 15600, status: 'Complétée', date: new Date('2026-02-08') }
    ];
  }

  loadImages() {
    this.marketService.getUploadedFiles().subscribe(files => {
      this.registeredImages = files;
    });
  }

  handleImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      this.marketService.uploadFile(file).subscribe({
        next: (res) => {
          this.newOffer.imageUrl = res.url;
          this.loadImages();
          this.isUploading = false;
        },
        error: () => this.isUploading = false
      });
    }
  }

  selectImage(url: string) {
    this.newOffer.imageUrl = url;
  }

  // Modal methods
  openOfferModal() {
    if (this.canCreateOffer) {
      this.isEditMode = false;
      this.editingOffer = null;
      this.newOffer = {
        product: '',
        quantity: 0,
        unit: 'kg',
        price: 0,
        quality: 'standard',
        availability: 'immediate',
        imageUrl: '',
        description: ''
      };
      this.showOfferModal = true;
    }
  }

  editOffer(offer: Offer) {
    if (this.canCreateOffer && (offer.status === 'pending' || offer.status === 'validated')) {
      this.isEditMode = true;
      this.editingOffer = offer;
      this.newOffer = { ...offer };
      this.showOfferModal = true;
    }
  }
  closeOfferModal() { 
    this.showOfferModal = false; 
    this.isEditMode = false;
    this.editingOffer = null;
    this.resetOfferForm(); 
  }

  openGroupedOfferModal() { if (this.canCreateGroupedOffer) this.showGroupedOfferModal = true; }
  closeGroupedOfferModal() { this.showGroupedOfferModal = false; }

  openPriceAlertModal() { if (this.canCreateOffer) this.showPriceAlertModal = true; }
  closePriceAlertModal() { this.showPriceAlertModal = false; }

  // Offer CRUD
  submitOffer() {
    if (!this.canCreateOffer) return;
    
    if (this.isEditMode && this.editingOffer && this.editingOffer.id) {
      // Update existing offer
      this.marketService.updateOffer(this.editingOffer.id, this.newOffer).subscribe({
        next: () => {
          this.refreshData();
          this.closeOfferModal();
        }
      });
    } else {
      // Create new offer
      this.marketService.createOffer(this.newOffer).subscribe({
        next: () => {
          this.refreshData();
          this.closeOfferModal();
        }
      });
    }
  }

  resetOfferForm() {
    this.newOffer = { product: '', quantity: 0, unit: 'kg', price: 0, quality: 'standard', availability: 'immediate', imageUrl: '', description: '' };
  }

  validateOffer(offer: Offer) {
    if (!this.canValidateOffer || !offer.id) return;
    this.marketService.validateOffer(offer.id).subscribe(() => {
      this.refreshData();
    });
  }

  deleteOffer(offer: Offer) {
    if (!offer.id) return;
    if (!this.canEditPrices && this.role !== 'producteur') return;
    this.marketService.deleteOffer(offer.id).subscribe(() => {
      this.refreshData();
    });
  }

  submitPriceAlert() {
    if (!this.canCreateOffer) return;
    this.priceAlerts.push({ product: this.priceAlert.product, threshold: this.priceAlert.threshold, type: this.priceAlert.type, active: true });
    this.closePriceAlertModal();
  }

  // Admin Price Alert methods
  openAdminAlertModal(offer: Offer) {
    this.selectedOfferForAlert = offer;
    this.adminAlertMessage = `Le prix de cet article (${this.formatCurrency(offer.price)}) semble anormal. Nous vous recommandons de le réviser.`;
    this.adminAlertSuggestedPrice = offer.price * 0.9; // Default suggestion -10%
    this.showAdminAlertModal = true;
  }

  closeAdminAlertModal() {
    this.showAdminAlertModal = false;
    this.selectedOfferForAlert = null;
  }

  confirmPriceAlert() {
    if (!this.selectedOfferForAlert?.id) return;
    this.marketService.sendPriceAlert(
      this.selectedOfferForAlert.id,
      this.adminAlertMessage,
      this.adminAlertSuggestedPrice
    ).subscribe(() => {
      this.refreshData();
      this.closeAdminAlertModal();
    });
  }

  get adminPriceAlerts(): Offer[] {
    return this.myOffers.filter(o => !!o.adminWarning);
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(d);
  }

  get roleLabel(): string {
    const labels: Record<RoleKey, string> = {
      producteur: 'Producteur',
      cooperative: 'Coopérative',
      admin: 'Administrateur',
      technicien: 'Technicien',
      ong: 'ONG',
      etat: 'État',
      viewer: 'Observateur'
    };
    return labels[this.role] ?? this.role;
  }

  get marketOffers(): Offer[] {
    const currentUserEmail = JSON.parse(localStorage.getItem('agrismart_user') || '{}').email;
    return this.offers.filter(o => o.status === 'validated' && o.ownerEmail !== currentUserEmail);
  }

  get pendingOffersCount(): number {
    return this.offers.filter(o => o.status === 'pending').length;
  }

  get filteredPriceData(): PriceData[] {
    return this.priceData.filter(data => {
      const productMatch = this.selectedProduct === 'all' || data.product === this.selectedProduct;
      const regionMatch = this.selectedRegion === 'all' || data.region === this.selectedRegion;
      return productMatch && regionMatch;
    });
  }
}
