import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ELearningService, Course, Chapter, Lesson } from '../../services/elearning.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-player.component.html',
  styleUrl: './course-player.component.scss'
})
export class CoursePlayerComponent implements OnInit {
  course: Course | null = null;
  selectedLesson: Lesson | null = null;
  loading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private elearningService: ELearningService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.elearningService.getCourseById(id).subscribe(course => {
        this.course = course;
        this.loading = false;
        if (course.chapters && course.chapters.length > 0 && course.chapters[0].lessons && course.chapters[0].lessons.length > 0) {
          this.selectedLesson = course.chapters[0].lessons[0];
        } else {
          // Fallback Lesson if none exist
          this.selectedLesson = {
            title: 'Contenu en cours de préparation',
            content: 'Le contenu de ce chapitre sera bientôt disponible.',
            type: 'text',
            completed: false
          };
        }
      });
    }
  }

  getSafeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return '';

    // YouTube treatment
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      }
      return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
    }

    // Direct link or other
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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
    if (!this.course || !this.course.chapters || this.course.chapters.length === 0) return 0;
    const allLessons = this.course.chapters.flatMap(c => c.lessons || []);
    if (allLessons.length === 0) return 0;
    const completed = allLessons.filter(l => l.completed).length;
    return Math.round((completed / allLessons.length) * 100);
  }
}
