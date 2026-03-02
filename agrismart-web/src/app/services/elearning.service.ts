import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lesson {
    id?: string;
    title: string;
    content: string;
    type: 'video' | 'text' | 'pdf' | 'youtube' | 'word';
    duration?: string;
    fileUrl?: string;
    youtubeUrl?: string;
    completed?: boolean;
    uploading?: boolean;
    fileName?: string;
}

export interface Chapter {
    title: string;
    lessons: Lesson[];
    isOpen?: boolean;
}

export interface Course {
    id?: string;
    title: string;
    description?: string;
    instructorId?: string;
    instructorName?: string;
    image?: string;
    tag?: string;
    chapters: Chapter[];
    progress?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ELearningService {
    private apiUrl = 'http://localhost:8080/api'; // Adjust to your backend port

    constructor(private http: HttpClient) { }

    getCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(`${this.apiUrl}/courses`);
    }

    getCourseById(id: string): Observable<Course> {
        return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
    }

    createCourse(course: Course): Observable<Course> {
        return this.http.post<Course>(`${this.apiUrl}/courses`, course);
    }

    updateCourse(id: string, course: Course): Observable<Course> {
        return this.http.put<Course>(`${this.apiUrl}/courses/${id}`, course);
    }

    deleteCourse(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/courses/${id}`);
    }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(`${this.apiUrl}/upload`, formData);
    }
}
