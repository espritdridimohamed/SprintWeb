import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgriComponent } from './pages/agri/agri.component';
import { AiComponent } from './pages/ai/ai.component';
import { DashboardIaComponent } from './pages/dashboard-ia/dashboard-ia.component';
import { ModelesIaComponent } from './pages/modeles-ia/modeles-ia.component';
import { SupportTicketsComponent } from './pages/support/support.component';
import { TicketConversationComponent } from './pages/ticket-conversation/ticket-conversation.component';
import { DiagnosticsListComponent } from './pages/diagnostics-list/diagnostics-list.component';
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
import { ProfileComponent } from './pages/profile/profile.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { MarketplaceViewComponent } from './pages/marketplace-view/marketplace-view.component';
import { ProductDetailViewComponent } from './pages/product-detail-view/product-detail-view.component';

export const routes: Routes = [
	{ path: '', component: LandingPageComponent },
	{ path: 'marketplace', component: MarketplaceViewComponent },
	{ path: 'product/:id', component: ProductDetailViewComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{
		path: 'app',
		component: AppLayoutComponent,
		canActivate: [authGuard],
		children: [
			{ path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard], data: { roles: ['viewer', 'producteur', 'technicien', 'cooperative', 'ong', 'etat'] } },
			{ path: 'profile', component: ProfileComponent, canActivate: [roleGuard], data: { roles: ['viewer', 'producteur', 'technicien', 'cooperative', 'ong', 'etat', 'admin'] } },
			{ path: 'agri', component: AgriComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien', 'cooperative'] } },
			{ path: 'ai', component: AiComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien', 'admin'] } },
			{ path: 'dashboard-ia', component: DashboardIaComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien', 'admin'] } },
			{ path: 'diagnostics', component: DiagnosticsListComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien', 'admin'] } },
			{ path: 'modeles-ia', component: ModelesIaComponent, canActivate: [roleGuard], data: { roles: ['admin', 'technicien'] } },
			{ path: 'support', component: SupportTicketsComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien'] } },
			{ path: 'support/ticket/:id', component: TicketConversationComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien'] } },
			{ path: 'planning', component: PlanningComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'cooperative', 'technicien', 'ong', 'etat', 'admin', 'viewer'] } },
			{ path: 'market', component: MarketComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'cooperative', 'technicien', 'ong', 'etat', 'admin', 'viewer'] } },
			{ path: 'impact', component: ImpactComponent, canActivate: [roleGuard], data: { roles: ['ong', 'etat'] } },
			{ path: 'admin', component: AdminComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
			{ path: 'communications', component: CommunicationsComponent, canActivate: [roleGuard], data: { roles: ['etat'] } },
			{ path: 'exports-decision', component: ExportsDecisionComponent, canActivate: [roleGuard], data: { roles: ['etat'] } },
			{ path: 'alerts', component: AlertsComponent, canActivate: [roleGuard], data: { roles: ['producteur', 'technicien', 'cooperative'] } },
			{ path: 'rapports', component: RapportsComponent, canActivate: [roleGuard], data: { roles: ['cooperative'] } },
			{ path: 'iot', component: IotComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
			{ path: 'logs', component: LogsComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	},
	{ path: '**', redirectTo: 'login' }
];
