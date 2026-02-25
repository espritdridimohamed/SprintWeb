import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CoursePart {
    title: string;
    content: string;
}

@Component({
    selector: 'app-e-learning',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './e-learning.component.html',
    styleUrl: './e-learning.component.scss'
})
export class ELearningComponent {
    isCreating = false;
    courseTitle = '';
    parts: CoursePart[] = [{ title: '', content: '' }];
    courses = [
        { name: 'Irrigation de précision', parts: 5, size: '12 Mo', status: 'Publié' },
        { name: 'Gestion des sols arides', parts: 3, size: '8 Mo', status: 'Brouillon' }
    ];

    startCreating() {
        this.isCreating = true;
    }

    addPart() {
        this.parts.push({ title: '', content: '' });
    }

    removePart(index: number) {
        if (this.parts.length > 1) {
            this.parts.splice(index, 1);
        }
    }

    saveCourse() {
        // Logic to save the course
        console.log('Saving course:', {
            title: this.courseTitle,
            parts: this.parts
        });
        this.isCreating = false;
        this.resetForm();
    }

    cancelCreating() {
        this.isCreating = false;
        this.resetForm();
    }

    resetForm() {
        this.courseTitle = '';
        this.parts = [{ title: '', content: '' }];
    }
}
