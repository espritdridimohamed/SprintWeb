import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarketService, Offer } from '../../services/market.service';

@Component({
  selector: 'app-marketplace-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace-view.component.html',
  styleUrl: './marketplace-view.component.scss'
})
export class MarketplaceViewComponent implements OnInit {
  searchQuery = '';
  isLoading = false;

  categories = ['All Products', 'Seeds', 'Fertilizers', 'Equipment', 'Livestock', 'Irrigation', 'Pest Control'];
  selectedCategory = 'All Products';

  products: any[] = [];

  constructor(
    private router: Router,
    private marketService: MarketService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.marketService.getAllOffers().subscribe({
      next: (offers) => {
        // Map backend Offers to the UI product structure
        this.products = offers.filter(o => o.status === 'validated').map(o => ({
          id: o.id,
          name: o.product,
          seller: o.producer || o.ownerEmail,
          price: `${o.price} TND`,
          rating: 4.5, // Mock rating for now
          reviews: 0,
          image: o.imageUrl || 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=400&q=80',
          tag: o.quality ? o.quality.toUpperCase() : null,
          description: o.description
        }));
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  viewDetails(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
