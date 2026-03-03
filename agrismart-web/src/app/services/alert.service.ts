import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AlertItem {
    id?: string;
    title: string;
    message: string;
    severity: 'urgent' | 'warning' | 'info';
    target?: string;
    createdBy?: string;
    createdAt?: string;
    resolved?: boolean;
    resolvedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
    private readonly apiUrl = 'http://localhost:8080/api/alerts';

    constructor(private http: HttpClient) { }

    getAll(): Observable<AlertItem[]> {
        return this.http.get<AlertItem[]>(this.apiUrl);
    }

    getActive(): Observable<AlertItem[]> {
        return this.http.get<AlertItem[]>(`${this.apiUrl}/active`);
    }

    create(alert: Partial<AlertItem>): Observable<AlertItem> {
        return this.http.post<AlertItem>(this.apiUrl, alert);
    }

    resolve(id: string): Observable<AlertItem> {
        return this.http.put<AlertItem>(`${this.apiUrl}/${id}/resolve`, {});
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
