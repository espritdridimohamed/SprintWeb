import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CoursePart {
    title: string;
    content: string;
}

@Component({
    selector: 'app-elearning',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './elearning.component.html',
    styleUrl: './elearning.component.scss'
})
export class ELearningComponent {
    isCreating = false;
    courseTitle = '';
    parts: CoursePart[] = [{ title: '', content: '' }];
    courses = [
        { name: 'Irrigation de précision', parts: 5, size: '12 Mo', status: 'Publié' },
        { name: 'Gestion des sols arides', parts: 3, size: '8 Mo', status: 'Brouillon' }
    ];

    isPublishPopupOpen = false;
    selectAll = false;
    members = [
        { id: 1, name: 'Jean Dupont', role: 'Producteur', selected: false },
        { id: 2, name: 'Marie Curie', role: 'Technicien', selected: false },
        { id: 3, name: 'Pierre Gasly', role: 'Coopérative', selected: false },
        { id: 4, name: 'Aicha Benali', role: 'Producteur', selected: false },
        { id: 5, name: 'Lucas Meyer', role: 'Technicien', selected: false }
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

    openPublishPopup() {
        if (!this.courseTitle.trim()) {
            alert('Veuillez donner un titre au cours avant de publier.');
            return;
        }
        this.isPublishPopupOpen = true;
    }

    closePublishPopup() {
        this.isPublishPopupOpen = false;
    }

    toggleSelectAll() {
        this.members.forEach(m => m.selected = this.selectAll);
    }

    onMemberSelect() {
        this.selectAll = this.members.every(m => m.selected);
    }

    get hasSelectedMembers(): boolean {
        return this.selectAll || this.members.some(m => m.selected);
    }

    confirmPublish() {
        const selectedMembers = this.members.filter(m => m.selected);
        console.log('Publishing course to:', {
            title: this.courseTitle,
            recipients: this.selectAll ? 'All members' : selectedMembers.map(m => m.name),
            parts: this.parts
        });

        this.isPublishPopupOpen = false;
        this.isCreating = false;
        this.resetForm();
    }

    saveCourse() {
        this.openPublishPopup();
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
