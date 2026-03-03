import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
    id?: string;
    product: string;
    producer?: string;
    quantity: number;
    unit: string;
    price: number;
    quality: string;
    availability: string;
    status: 'pending' | 'validated' | 'sold';
    imageUrl?: string;
    description?: string;
    adminWarning?: string;
    suggestedPrice?: number;
    ownerEmail?: string;
    date?: Date;
}

@Injectable({ providedIn: 'root' })
export class MarketService {
    private readonly apiUrl = 'http://localhost:8080/api/market';

    constructor(private http: HttpClient) { }

    getAllOffers(): Observable<Offer[]> {
        return this.http.get<Offer[]>(`${this.apiUrl}/offers`);
    }

    createOffer(offer: Partial<Offer>): Observable<Offer> {
        return this.http.post<Offer>(`${this.apiUrl}/offers`, offer);
    }

    updateOffer(id: string, offer: Partial<Offer>): Observable<Offer> {
        return this.http.put<Offer>(`${this.apiUrl}/offers/${id}`, offer);
    }

    deleteOffer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/offers/${id}`);
    }

    validateOffer(id: string): Observable<Offer> {
        return this.http.put<Offer>(`${this.apiUrl}/offers/${id}/validate`, {});
    }

    getPrices(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/prices`);
    }

    getUploadedFiles(): Observable<any[]> {
        return this.http.get<any[]>('http://localhost:8080/api/upload/files');
    }

    uploadFile(file: File): Observable<{ url: string; fileName: string }> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post<{ url: string; fileName: string }>('http://localhost:8080/api/upload', formData);
    }

    sendPriceAlert(offerId: string, message: string, suggestedPrice?: number): Observable<Offer> {
        return this.http.post<Offer>(`${this.apiUrl}/offers/${offerId}/price-alert`, { message, suggestedPrice });
    }
}
