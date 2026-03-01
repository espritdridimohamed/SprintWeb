import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AgriTask {
    id?: string;
    title: string;
    description: string;
    status: 'todo' | 'inprogress' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: Date;
    ownerEmail?: string;
    assignedTo?: string;
    createdAt?: Date;
}

@Injectable({ providedIn: 'root' })
export class PlanningService {
    private readonly apiUrl = 'http://localhost:8080/api/planning';

    constructor(private http: HttpClient) { }

    getAllTasks(): Observable<AgriTask[]> {
        return this.http.get<AgriTask[]>(`${this.apiUrl}/tasks`);
    }

    createTask(task: Partial<AgriTask>): Observable<AgriTask> {
        return this.http.post<AgriTask>(`${this.apiUrl}/tasks`, task);
    }

    updateTask(id: string, task: Partial<AgriTask>): Observable<AgriTask> {
        return this.http.put<AgriTask>(`${this.apiUrl}/tasks/${id}`, task);
    }

    updateTaskStatus(id: string, status: string): Observable<AgriTask> {
        return this.http.put<AgriTask>(`${this.apiUrl}/tasks/${id}/status`, { status });
    }

    deleteTask(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/tasks/${id}`);
    }

    getCampaigns(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/campaigns`);
    }

    getResources(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/resources`);
    }
}
