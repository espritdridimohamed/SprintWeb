import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { RoleSelectComponent } from './pages/role-select/role-select.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgriComponent } from './pages/agri/agri.component';
import { AiComponent } from './pages/ai/ai.component';
import { SupportComponent } from './pages/support/support.component';
import { PlanningComponent } from './pages/planning/planning.component';
import { MarketComponent } from './pages/market/market.component';
import { TrainingComponent } from './pages/training/training.component';
import { ImpactComponent } from './pages/impact/impact.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CommunicationsComponent } from './pages/communications/communications.component';
import { ExportsDecisionComponent } from './pages/exports-decision/exports-decision.component';
import { AlertsComponent } from './pages/alerts/alerts.component';
import { RapportsComponent } from './pages/rapports/rapports.component';
import { IotComponent } from './pages/iot/iot.component';
import { LogsComponent } from './pages/logs/logs.component';


export const routes: Routes = [
	{ path: '', redirectTo: 'login', pathMatch: 'full' },
	{ path: 'login', component: LoginComponent },
	{ path: 'role', component: RoleSelectComponent },
	{
		path: 'app',
		component: AppLayoutComponent,
		children: [
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'agri', component: AgriComponent },
			{ path: 'ai', component: AiComponent },
			{ path: 'support', component: SupportComponent },
			{ path: 'planning', component: PlanningComponent },
			{ path: 'market', component: MarketComponent },
			{ path: 'training', component: TrainingComponent },
			{ path: 'impact', component: ImpactComponent },
			{ path: 'admin', component: AdminComponent },
			{ path: 'communications', component: CommunicationsComponent },
			{ path: 'exports-decision', component: ExportsDecisionComponent },
			{ path: 'alerts', component: AlertsComponent },
			{ path: 'rapports', component: RapportsComponent },
			{ path: 'iot', component: IotComponent },
			{ path: 'logs', component: LogsComponent },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
			
		]
	},
	{ path: '**', redirectTo: 'login' },


];
