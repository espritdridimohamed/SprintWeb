import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-marketplace-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace-view.component.html',
  styleUrl: './marketplace-view.component.scss'
})
export class MarketplaceViewComponent {
  searchQuery = '';

  categories = ['All Products', 'Seeds', 'Fertilizers', 'Equipment', 'Livestock', 'Irrigation', 'Pest Control'];
  selectedCategory = 'All Products';

  products = [
    {
      id: 1,
      name: 'Semences de Maïs Hybride',
      seller: 'AgroVinci Sahel',
      price: '15,500 CFA',
      rating: 4.8,
      reviews: 120,
      image: 'https://images.unsplash.com/photo-1551733229-8730ad3d7e7c?auto=format&fit=crop&w=400&q=80',
      tag: 'CERTIFIED'
    },
    {
      id: 2,
      name: 'Engrais Organique NPK 15-15-15',
      seller: 'Biostim Africa',
      price: '28,000 CFA',
      rating: 4.9,
      reviews: 85,
      image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=400&q=80',
      tag: 'TOP RATED'
    },
    {
      id: 3,
      name: 'Motoculteur Diesel 7CV',
      seller: 'Sénégal Matériel',
      price: '450,000 CFA',
      rating: 4.5,
      reviews: 42,
      image: 'https://images.unsplash.com/photo-1592931139452-f6111fdb8543?auto=format&fit=crop&w=400&q=80',
      tag: null
    },
    {
      id: 4,
      name: 'Pompe Solaire d\'Irrigation',
      seller: 'EcoWatts Agri',
      price: '125,000 CFA',
      rating: 4.7,
      reviews: 18,
      image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80',
      tag: 'NEW'
    },
    {
      id: 5,
      name: 'Aliment Bétail Croissance',
      seller: 'Global Livestock Co.',
      price: '12,500 CFA',
      rating: 4.6,
      reviews: 215,
      image: 'https://images.unsplash.com/photo-1547496613-4e193fb3546a?auto=format&fit=crop&w=400&q=80',
      tag: null
    },
    {
      id: 6,
      name: 'Kit de Semences Maraîchères',
      seller: 'Fermes du Sine',
      price: '5,000 CFA',
      rating: 4.3,
      reviews: 56,
      image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=400&q=80',
      tag: null
    }
  ];

  constructor(private router: Router) { }

  viewDetails(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
