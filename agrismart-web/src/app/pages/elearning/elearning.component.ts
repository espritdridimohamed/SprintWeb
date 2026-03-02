import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { ELearningService, Course, Chapter, Lesson } from '../../services/elearning.service';

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
    isEditing = false;
    currentCourseId: string | null = null;
    courseTitle = '';
    courseDescription = '';
    courseImage = '';
    courseTag = '';

    chapters: Chapter[] = [{ title: 'Introduction', lessons: [], isOpen: true }];

    // Real Data
    managementCourses: Course[] = [];
    studentCourses: Course[] = [];

    activeCourse: any = null;

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
        private elearningService: ELearningService,
        private router: Router
    ) { }

    ngOnInit() {
        this.currentRole = this.roleService.role;
        this.loadCourses();
    }

    loadCourses() {
        this.elearningService.getCourses().subscribe(courses => {
            this.managementCourses = courses;
            this.studentCourses = courses;
            if (courses.length > 0) {
                this.activeCourse = courses[0]; // Simple logic for demo
            }
        });
    }

    get isManagementMode(): boolean {
        return ['admin', 'ong', 'cooperative'].includes(this.currentRole);
    }

    startCreating() {
        this.isCreating = true;
        this.isEditing = false;
        this.resetForm();
    }

    addPart() {
        this.chapters.push({ title: '', lessons: [], isOpen: true });
    }

    removePart(index: number) {
        if (this.chapters.length > 1) {
            this.chapters.splice(index, 1);
        }
    }

    addSection(chapterIndex: number) {
        if (!this.chapters[chapterIndex].lessons) {
            this.chapters[chapterIndex].lessons = [];
        }
        this.chapters[chapterIndex].lessons.push({
            title: '',
            content: '',
            type: 'text',
            completed: false
        });
    }

    removeSection(chapterIndex: number, sectionIndex: number) {
        this.chapters[chapterIndex].lessons.splice(sectionIndex, 1);
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
        const course: Course = {
            id: this.currentCourseId || undefined,
            title: this.courseTitle,
            description: this.courseDescription || 'Formation AgriSmart', // Default value
            image: this.courseImage || 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=800&q=80', // Default value
            tag: this.courseTag || 'Technique',
            chapters: this.chapters,
            instructorName: 'Admin / ONG'
        };

        if (this.isEditing && this.currentCourseId) {
            this.elearningService.updateCourse(this.currentCourseId, course).subscribe(() => {
                this.finishSaving();
            });
        } else {
            this.elearningService.createCourse(course).subscribe(() => {
                this.finishSaving();
            });
        }
    }

    finishSaving() {
        this.isPublishPopupOpen = false;
        this.isCreating = false;
        this.isEditing = false;
        this.loadCourses();
        this.resetForm();
    }

    saveCourse() {
        this.openPublishPopup();
    }

    cancelCreating() {
        this.isCreating = false;
        this.resetForm();
    }

    editCourse(course: Course) {
        this.isCreating = true;
        this.isEditing = true;
        this.currentCourseId = course.id!;
        this.courseTitle = course.title;
        this.courseDescription = course.description || '';
        this.courseImage = course.image || '';
        this.courseTag = course.tag || '';
        this.chapters = JSON.parse(JSON.stringify(course.chapters)); // Deep copy
    }

    deleteCourse(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
            this.elearningService.deleteCourse(id).subscribe(() => {
                this.loadCourses();
            });
        }
    }

    onFileSelected(event: any, section: Lesson) {
        const file = event.target.files[0];
        if (file) {
            section.uploading = true;
            this.elearningService.uploadFile(file).subscribe({
                next: (res: any) => {
                    section.content = res.url;
                    section.fileName = file.name;
                    section.uploading = false;
                },
                error: (err) => {
                    console.error('Upload failed', err);
                    alert('Le chargement du fichier a échoué.');
                    section.uploading = false;
                }
            });
        }
    }

    resetForm() {
        this.currentCourseId = null;
        this.courseTitle = '';
        this.courseDescription = '';
        this.courseImage = '';
        this.courseTag = '';
        this.chapters = [{ title: 'Introduction', lessons: [], isOpen: true }];
    }

    openCourse(courseId: string) {
        this.router.navigate(['/app/course', courseId]);
    }
}
