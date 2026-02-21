import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Lesson {
  id: number;
  title: string;
  completed: boolean;
  content: string;
  type: 'video' | 'text' | 'pdf';
  duration: string;
}

interface Chapter {
  title: string;
  lessons: Lesson[];
  isOpen: boolean;
}

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.scss'
})
export class CoursePlayerComponent implements OnInit {
  courseTitle = 'Optimisation de l\'irrigation goutte-à-goutte';
  chapters: Chapter[] = [
    {
      title: 'Introduction et Fondamentaux',
      isOpen: true,
      lessons: [
        { id: 1, title: 'Bienvenue au cours', completed: true, type: 'video', duration: '2:30', content: 'Bienvenue dans ce module de formation sur l\'irrigation. Dans cette vidéo, nous allons voir les bases du système goutte-à-goutte.' },
        { id: 2, title: 'Pourquoi le goutte-à-goutte ?', completed: true, type: 'text', duration: '10 min', content: '<p>L\'irrigation goutte-à-goutte est une méthode d\'irrigation qui permet d\'économiser l\'eau et l\'engrais en laissant l\'eau s\'égoutter lentement vers les racines des plantes...</p><ul><li>Économie d\'eau</li><li>Précision</li><li>Rendement accru</li></ul>' }
      ]
    },
    {
      title: 'Installation du Système',
      isOpen: true,
      lessons: [
        { id: 3, title: 'Matériel nécessaire', completed: false, type: 'pdf', duration: '5 pages', content: 'Voici la liste complète du matériel nécessaire pour installer votre système : tuyaux, raccords, filtres, et régulateurs de pression.' },
        { id: 4, title: 'Configuration du terrain', completed: false, type: 'video', duration: '15:45', content: 'Cette vidéo vous montre comment préparer votre sol et disposer vos lignes d\'irrigation de manière optimale.' },
        { id: 5, title: 'Raccordement à la source d\'eau', completed: false, type: 'text', duration: '15 min', content: 'Le raccordement est l\'étape la plus cruciale. Assurez-vous d\'avoir une pression constante.' }
      ]
    },
    {
      title: 'Maintenance et IA',
      isOpen: false,
      lessons: [
        { id: 6, title: 'Nettoyage des filtres', completed: false, type: 'video', duration: '5:20', content: 'Apprenez à entretenir vos filtres pour éviter les obstructions.' },
        { id: 7, title: 'Utilisation de l\'IA AgriSmart', completed: false, type: 'text', duration: '12 min', content: 'Comment utiliser nos capteurs connectés pour automatiser votre arrosage.' }
      ]
    }
  ];

  selectedLesson: Lesson = this.chapters[0].lessons[0];

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // Find lesson by params if needed
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson = lesson;
  }

  toggleChapter(chapter: Chapter) {
    chapter.isOpen = !chapter.isOpen;
  }

  markAsDone(lesson: Lesson, event: Event) {
    event.stopPropagation();
    lesson.completed = !lesson.completed;
  }

  goBack() {
    this.router.navigate(['/app/e-learning']);
  }

  get totalProgress(): number {
    const allLessons = this.chapters.flatMap(c => c.lessons);
    const completed = allLessons.filter(l => l.completed).length;
    return Math.round((completed / allLessons.length) * 100);
  }
}
