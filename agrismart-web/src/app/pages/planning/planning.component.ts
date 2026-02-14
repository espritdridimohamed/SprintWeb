import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  type: 'semis' | 'irrigation' | 'traitement' | 'recolte' | 'autre';
  parcel?: string;
  date: Date;
  status: 'todo' | 'inprogress' | 'done' | 'late';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  description?: string;
}

interface Campaign {
  id: number;
  name: string;
  zone: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  status: string;
}

interface Resource {
  id: number;
  name: string;
  type: string;
  availability: string;
  bookedBy?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.scss'
})
export class PlanningComponent implements OnInit {
  // User role simulation
  userRole: 'producteur' | 'cooperative' | 'technicien' | 'admin' | 'viewer' = 'producteur';

  // Modal states
  showTaskModal = false;
  showCampaignModal = false;
  showResourceModal = false;

  // Calendar
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;

  // View mode
  viewMode: 'month' | 'week' | 'list' = 'month';

  // Form data
  newTask: Partial<Task> = {
    title: '',
    type: 'semis',
    parcel: '',
    date: new Date(),
    status: 'todo',
    priority: 'medium',
    description: ''
  };

  newCampaign = {
    name: '',
    zone: '',
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  };

  // Data
  tasks: Task[] = [];
  campaigns: Campaign[] = [];
  resources: Resource[] = [];

  // Statistics
  stats = {
    totalTasks: 45,
    completedTasks: 32,
    lateTasks: 3,
    upcomingTasks: 10,
    activeCampaigns: 5,
    totalParticipants: 28
  };

  // Filters
  selectedParcel = 'all';
  selectedTaskType = 'all';
  selectedStatus = 'all';

  parcels = ['Parcelle A', 'Parcelle B', 'Parcelle C', 'Parcelle D'];
  taskTypes = [
    { value: 'semis', label: 'Semis', icon: 'agriculture' },
    { value: 'irrigation', label: 'Irrigation', icon: 'water_drop' },
    { value: 'traitement', label: 'Traitement', icon: 'science' },
    { value: 'recolte', label: 'Récolte', icon: 'inventory' },
    { value: 'autre', label: 'Autre', icon: 'more_horiz' }
  ];

  monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  ngOnInit() {
    this.loadMockData();
    this.generateCalendar();
  }

  loadMockData() {
    // Mock tasks
    this.tasks = [
      { id: 1, title: 'Semis blé', type: 'semis', parcel: 'Parcelle A', date: new Date(2026, 1, 20), status: 'done', priority: 'high' },
      { id: 2, title: 'Irrigation tomates', type: 'irrigation', parcel: 'Parcelle B', date: new Date(2026, 1, 18), status: 'done', priority: 'medium' },
      { id: 3, title: 'Traitement fongicide', type: 'traitement', parcel: 'Parcelle A', date: new Date(2026, 1, 22), status: 'inprogress', priority: 'high' },
      { id: 4, title: 'Récolte olives', type: 'recolte', parcel: 'Parcelle C', date: new Date(2026, 1, 25), status: 'todo', priority: 'medium' },
      { id: 5, title: 'Préparation sol', type: 'autre', parcel: 'Parcelle D', date: new Date(2026, 1, 16), status: 'late', priority: 'high' },
      { id: 6, title: 'Semis maïs', type: 'semis', parcel: 'Parcelle B', date: new Date(2026, 1, 28), status: 'todo', priority: 'medium' },
      { id: 7, title: 'Irrigation blé', type: 'irrigation', parcel: 'Parcelle A', date: new Date(2026, 1, 24), status: 'todo', priority: 'low' }
    ];

    // Mock campaigns
    this.campaigns = [
      { id: 1, name: 'Campagne printemps 2026', zone: 'Zone Nord', startDate: new Date(2026, 2, 1), endDate: new Date(2026, 4, 31), participants: 12, status: 'En cours' },
      { id: 2, name: 'Formation irrigation', zone: 'Zone Centre', startDate: new Date(2026, 1, 15), endDate: new Date(2026, 1, 16), participants: 8, status: 'Planifiée' },
      { id: 3, name: 'Récolte collective olives', zone: 'Zone Sud', startDate: new Date(2026, 3, 1), endDate: new Date(2026, 3, 15), participants: 15, status: 'Planifiée' }
    ];

    // Mock resources
    this.resources = [
      { id: 1, name: 'Tracteur John Deere', type: 'Machine', availability: 'Disponible' },
      { id: 2, name: 'Système irrigation goutte à goutte', type: 'Équipement', availability: 'Réservé', bookedBy: 'Ferme Martin' },
      { id: 3, name: 'Semences bio blé', type: 'Intrant', availability: 'Disponible' },
      { id: 4, name: 'Pulvérisateur', type: 'Machine', availability: 'En maintenance' }
    ];
  }

  // Calendar methods
  generateCalendar() {
    this.calendarDays = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const nextDays = 7 - lastDayIndex - 1;

    // Previous month days
    for (let x = firstDayIndex; x > 0; x--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - x + 1);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date)
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const today = new Date();
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        tasks: this.getTasksForDate(date)
      });
    }

    // Next month days
    for (let j = 1; j <= nextDays; j++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, j);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date)
      });
    }
  }

  getTasksForDate(date: Date): Task[] {
    return this.tasks.filter(task =>
      task.date.toDateString() === date.toDateString()
    );
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  goToToday() {
    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar();
  }

  selectDate(day: CalendarDay) {
    this.selectedDate = day.date;
  }

  // Modal methods
  openTaskModal() {
    this.showTaskModal = true;
  }

  closeTaskModal() {
    this.showTaskModal = false;
    this.resetTaskForm();
  }

  openCampaignModal() {
    this.showCampaignModal = true;
  }

  closeCampaignModal() {
    this.showCampaignModal = false;
  }

  openResourceModal() {
    this.showResourceModal = true;
  }

  closeResourceModal() {
    this.showResourceModal = false;
  }

  // Task methods
  submitTask() {
    const task: Task = {
      id: this.tasks.length + 1,
      title: this.newTask.title || '',
      type: this.newTask.type || 'semis',
      parcel: this.newTask.parcel,
      date: this.newTask.date || new Date(),
      status: 'todo',
      priority: this.newTask.priority || 'medium',
      description: this.newTask.description
    };

    this.tasks.push(task);
    this.generateCalendar();
    this.closeTaskModal();
  }

  resetTaskForm() {
    this.newTask = {
      title: '',
      type: 'semis',
      parcel: '',
      date: new Date(),
      status: 'todo',
      priority: 'medium',
      description: ''
    };
  }

  updateTaskStatus(task: Task, newStatus: Task['status']) {
    task.status = newStatus;
    this.generateCalendar();
  }

  // Campaign methods
  submitCampaign() {
    const campaign: Campaign = {
      id: this.campaigns.length + 1,
      name: this.newCampaign.name,
      zone: this.newCampaign.zone,
      startDate: this.newCampaign.startDate,
      endDate: this.newCampaign.endDate,
      participants: 0,
      status: 'Planifiée'
    };

    this.campaigns.push(campaign);
    this.closeCampaignModal();
  }

  // Utility methods
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'todo': 'status-todo',
      'inprogress': 'status-progress',
      'done': 'status-done',
      'late': 'status-late',
      'En cours': 'status-progress',
      'Planifiée': 'status-planned',
      'Terminée': 'status-done'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high'
    };
    return priorityMap[priority] || '';
  }

  getTaskTypeIcon(type: string): string {
    const task = this.taskTypes.find(t => t.value === type);
    return task ? task.icon : 'event';
  }

  getTaskTypeLabel(type: string): string {
    const task = this.taskTypes.find(t => t.value === type);
    return task ? task.label : type;
  }

  getTaskTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'semis': '#10b981',
      'irrigation': '#3b82f6',
      'traitement': '#f59e0b',
      'recolte': '#8b5cf6',
      'autre': '#6b7280'
    };
    return colors[type] || '#6b7280';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
  }

  formatDateLong(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  }

  // Role switching
  switchRole(role: 'producteur' | 'cooperative' | 'technicien' | 'admin' | 'viewer') {
    this.userRole = role;
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const parcelMatch = this.selectedParcel === 'all' || task.parcel === this.selectedParcel;
      const typeMatch = this.selectedTaskType === 'all' || task.type === this.selectedTaskType;
      const statusMatch = this.selectedStatus === 'all' || task.status === this.selectedStatus;
      return parcelMatch && typeMatch && statusMatch;
    });
  }

  get upcomingTasks(): Task[] {
    const today = new Date();
    return this.tasks
      .filter(task => task.date >= today && task.status !== 'done')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5);
  }

  get lateTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'late');
  }

  get completionRate(): number {
    if (this.tasks.length === 0) return 0;
    const completed = this.tasks.filter(t => t.status === 'done').length;
    return Math.round((completed / this.tasks.length) * 100);
  }
}
