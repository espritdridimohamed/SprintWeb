import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-detail-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-detail-view.component.html',
  styleUrl: './product-detail-view.component.scss'
})
export class ProductDetailViewComponent implements OnInit {
  product: any = {
    id: 2,
    name: 'Engrais Organique Premium 25kg - Croissance Rapide',
    price: '45,000 FCFA',
    oldPrice: '52,000 FCFA',
    ref: 'AGR-7724',
    status: 'STOCK DISPONIBLE',
    seller: {
      name: 'Fermes du Vallon',
      rating: 4.8,
      reviews: 128,
      avatar: 'https://ui-avatars.com/api/?name=Fermes+du+Vallon&background=6b9f3e&color=fff'
    },
    description: 'Cet engrais organique premium est riche en azote, phosphore et potassium. Idéal pour booster le rendement de vos cultures maraîchères et fruitières tout en respectant l\'environnement. Formulé à partir de compost naturel décomposé.',
    specs: [
      { label: 'Poids', value: '25 Kg' },
      { label: 'Origine', value: 'Locale' },
      { label: 'Usage', value: 'Maraîchage' },
      { label: 'Certification', value: 'Bio' }
    ],
    details: [
      { label: 'Azote (N)', value: '4.2%' },
      { label: 'Phosphore (P2O5)', value: '3.1%' },
      { label: 'Potassium (K2O)', value: '2.8%' },
      { label: 'Matière Organique', value: '65%' }
    ],
    images: [
      'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1628352081506-83c43143df6a?auto=format&fit=crop&w=400&q=80'
    ],
    selectedImageIndex: 0
  };

  quantity = 1;

  similarProducts = [
    { name: 'Solution Nutritive Liquide', price: '12,500 FCFA', image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=300&q=80' },
    { name: 'Compost Purifié 10kg', price: '8,000 FCFA', image: 'https://images.unsplash.com/photo-1621464759392-00d94445558c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kit Semences Maraîchères', price: '15,000 FCFA', image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=300&q=80' },
    { name: 'Spray Foliaire Organique', price: '5,500 FCFA', image: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=300&q=80' }
  ];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // In a real app we would fetch by ID
  }

  goBack() {
    this.router.navigate(['/marketplace']);
  }

  changeImage(index: number) {
    this.product.selectedImageIndex = index;
  }
}
