import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { RoleKey } from '../../models/role.model';
import { PlanningService, AgriTask } from '../../services/planning.service';

interface Task {
  id: string;
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
  isLoading = false;
  // Expose Math to template
  // Real role from JWT via RoleService
  get role(): RoleKey {
    return this.roleService.role;
  }

  // --- Permission helpers ---
  /** PRODUCTEUR, COOPERATIVE, ADMIN peuvent créer des tâches */
  get canCreateTask(): boolean {
    return this.role === 'producteur' || this.role === 'cooperative' || this.role === 'admin';
  }

  /** TECHNICIEN (et ADMIN) peuvent uniquement mettre à jour le statut des tâches assignées */
  get canUpdateStatus(): boolean {
    return this.role === 'technicien' || this.role === 'admin';
  }

  /** ADMIN peut supprimer des tâches */
  get canDeleteTask(): boolean {
    return this.role === 'admin';
  }

  /** COOPERATIVE, ADMIN gèrent les campagnes */
  get canManageCampaign(): boolean {
    return this.role === 'cooperative' || this.role === 'admin';
  }

  /** COOPERATIVE, ONG, ETAT, ADMIN peuvent modifier les campagnes */
  get canModifyCampaign(): boolean {
    return this.role === 'cooperative' || this.role === 'ong' || this.role === 'etat' || this.role === 'admin';
  }

  /** COOPERATIVE, TECHNICIEN, ADMIN peuvent gérer les ressources */
  get canManageResources(): boolean {
    return this.role === 'cooperative' || this.role === 'technicien' || this.role === 'admin';
  }

  /** ETAT, ADMIN ont accès aux stats nationales */
  get canViewNationalStats(): boolean {
    return this.role === 'etat' || this.role === 'admin';
  }

  /** Rôles en lecture seule */
  get isReadOnly(): boolean {
    return this.role === 'viewer';
  }

  // Modal states
  showTaskModal = false;
  showCampaignModal = false;
  showResourceModal = false;
  showStatusModal = false;
  selectedTaskForStatus: any | null = null;

  // Calendar
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDate: Date | null = null;

  // View mode
  viewMode: 'month' | 'week' | 'list' = 'month';

  // Form data
  newTask: any = {
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
  tasks: any[] = [];
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

  constructor(
    private roleService: RoleService,
    private planningService: PlanningService
  ) { }

  ngOnInit() {
    this.refreshData();
    this.generateCalendar();
  }

  refreshData() {
    this.isLoading = true;
    this.planningService.getAllTasks().subscribe({
      next: (tasks: any[]) => {
        // Map backend Date if needed
        this.tasks = tasks.map(t => ({
          ...t,
          date: t.dueDate ? new Date(t.dueDate) : new Date(t.createdAt || Date.now())
        }));
        this.generateCalendar();
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });

    this.planningService.getCampaigns().subscribe(c => this.campaigns = c);
    this.planningService.getResources().subscribe(r => this.resources = r);
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

    for (let x = firstDayIndex; x > 0; x--) {
      const date = new Date(this.currentYear, this.currentMonth - 1, prevLastDay.getDate() - x + 1);
      this.calendarDays.push({ date, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(date) });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const today = new Date();
      this.calendarDays.push({ date, isCurrentMonth: true, isToday: date.toDateString() === today.toDateString(), tasks: this.getTasksForDate(date) });
    }
    for (let j = 1; j <= nextDays; j++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, j);
      this.calendarDays.push({ date, isCurrentMonth: false, isToday: false, tasks: this.getTasksForDate(date) });
    }
  }

  getTasksForDate(date: Date): any[] {
    return this.tasks.filter(task => new Date(task.date).toDateString() === date.toDateString());
  }

  previousMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) { this.currentMonth = 11; this.currentYear--; }
    this.generateCalendar();
  }

  nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) { this.currentMonth = 0; this.currentYear++; }
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
  openTaskModal() { if (this.canCreateTask) this.showTaskModal = true; }
  closeTaskModal() { this.showTaskModal = false; this.resetTaskForm(); }

  openCampaignModal() { if (this.canManageCampaign) this.showCampaignModal = true; }
  closeCampaignModal() { this.showCampaignModal = false; }

  openResourceModal() { if (this.canManageResources) this.showResourceModal = true; }
  closeResourceModal() { this.showResourceModal = false; }

  openStatusModal(task: any) {
    if (!this.canUpdateStatus) return;
    this.selectedTaskForStatus = task;
    this.showStatusModal = true;
  }
  closeStatusModal() { this.showStatusModal = false; this.selectedTaskForStatus = null; }

  // Task methods
  submitTask() {
    if (!this.canCreateTask) return;
    const taskData = {
      ...this.newTask,
      dueDate: this.newTask.date
    };
    this.planningService.createTask(taskData).subscribe(() => {
      this.refreshData();
      this.closeTaskModal();
    });
  }

  resetTaskForm() {
    this.newTask = { title: '', type: 'semis', parcel: '', date: new Date(), status: 'todo', priority: 'medium', description: '' };
  }

  /** TECHNICIEN + ADMIN : mettre à jour uniquement le status */
  updateTaskStatus(task: any, newStatus: string) {
    if (!this.canUpdateStatus || !task.id) return;
    this.planningService.updateTaskStatus(task.id, newStatus).subscribe(() => {
      this.refreshData();
      this.closeStatusModal();
    });
  }

  /** ADMIN seulement : supprimer une tâche */
  deleteTask(task: any) {
    if (!this.canDeleteTask || !task.id) return;
    this.planningService.deleteTask(task.id).subscribe(() => {
      this.refreshData();
    });
  }

  // Campaign methods
  submitCampaign() {
    if (!this.canManageCampaign) return;
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
      'todo': 'status-todo', 'inprogress': 'status-progress', 'done': 'status-done',
      'late': 'status-late', 'En cours': 'status-progress', 'Planifiée': 'status-planned',
      'Terminée': 'status-done'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = { 'low': 'priority-low', 'medium': 'priority-medium', 'high': 'priority-high' };
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
      'semis': '#10b981', 'irrigation': '#3b82f6', 'traitement': '#f59e0b',
      'recolte': '#8b5cf6', 'autre': '#6b7280'
    };
    return colors[type] || '#6b7280';
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(date);
  }

  formatDateLong(date: Date): string {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
  }

  get roleLabel(): string {
    const labels: Record<RoleKey, string> = {
      producteur: 'Producteur', cooperative: 'Coopérative', admin: 'Administrateur',
      technicien: 'Technicien', ong: 'ONG', etat: 'État', viewer: 'Observateur'
    };
    return labels[this.role] ?? this.role;
  }

  get filteredTasks(): any[] {
    return this.tasks.filter(task => {
      const parcelMatch = this.selectedParcel === 'all' || task.parcel === this.selectedParcel;
      const typeMatch = this.selectedTaskType === 'all' || task.type === this.selectedTaskType;
      const statusMatch = this.selectedStatus === 'all' || task.status === this.selectedStatus;
      return parcelMatch && typeMatch && statusMatch;
    });
  }

  /** TECHNICIEN : uniquement ses tâches assignées */
  get myAssignedTasks(): any[] {
    // In real app use the authenticated user's email
    return this.tasks.filter(t => t.assignedTo === 'technicien@farm.tn');
  }

  get upcomingTasks(): any[] {
    const today = new Date();
    return this.tasks
      .filter(task => new Date(task.date) >= today && task.status !== 'done')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }

  get lateTasks(): any[] {
    return this.tasks.filter(t => t.status === 'late');
  }

  get doneTasks(): number {
    return this.tasks.filter(t => t.status === 'done').length;
  }

  get inProgressTasks(): number {
    return this.tasks.filter(t => t.status === 'inprogress').length;
  }

  get completionRate(): number {
    if (this.tasks.length === 0) return 0;
    return Math.round((this.doneTasks / this.tasks.length) * 100);
  }
}
