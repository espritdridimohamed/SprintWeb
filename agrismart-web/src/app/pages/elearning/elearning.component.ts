import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';

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
export class ELearningComponent implements OnInit {
    isCreating = false;
    courseTitle = '';
    parts: CoursePart[] = [{ title: '', content: '' }];

    // Management Data
    courses = [
        { id: 1, name: 'Irrigation de précision', parts: 5, size: '12 Mo', status: 'Publié', image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80', progress: 0 },
        { id: 2, name: 'Gestion des sols arides', parts: 3, size: '8 Mo', status: 'Brouillon', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80', progress: 0 }
    ];

    // Student Data
    studentCourses = [
        { id: 1, title: 'Optimisation de l\'irrigation', instructor: 'Dr. Sarah Toumi', progress: 65, totalParts: 8, image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=400&q=80', tag: 'Technique' },
        { id: 2, title: 'Commercialisation locale', instructor: 'Jean-Pierre Adam', progress: 20, totalParts: 12, image: 'https://images.unsplash.com/photo-1488459711612-da6ad8d39a6a?auto=format&fit=crop&w=400&q=80', tag: 'Business' },
        { id: 3, title: 'Engrais Bio : Guide Complet', instructor: 'Fermes du Vallon', progress: 0, totalParts: 5, image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=400&q=80', tag: 'Durable' },
        { id: 4, title: 'Santé animale et diagnostic', instructor: 'Global Livestock', progress: 90, totalParts: 15, image: 'https://images.unsplash.com/photo-1547496613-4e193fb3546a?auto=format&fit=crop&w=400&q=80', tag: 'Elevage' }
    ];

    activeCourse = {
        id: 1,
        title: 'Optimisation de l\'irrigation goutte-à-goutte',
        instructor: 'Dr. Sarah Toumi',
        progress: 65,
        image: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80',
        nextLesson: 'Installation des Micro-Aspergeurs'
    };

    currentRole = 'admin';

    isPublishPopupOpen = false;
    selectAll = false;
    members = [
        { id: 1, name: 'Jean Dupont', role: 'Producteur', selected: false },
        { id: 2, name: 'Marie Curie', role: 'Technicien', selected: false },
        { id: 3, name: 'Pierre Gasly', role: 'Coopérative', selected: false },
        { id: 4, name: 'Aicha Benali', role: 'Producteur', selected: false },
        { id: 5, name: 'Lucas Meyer', role: 'Technicien', selected: false }
    ];

    constructor(
        private roleService: RoleService,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentRole = this.roleService.role;
    }

    get isManagementMode(): boolean {
        return ['admin', 'ong', 'cooperative'].includes(this.currentRole);
    }

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

    openCourse(courseId: number) {
        this.router.navigate(['/app/course', courseId]);
    }
}
