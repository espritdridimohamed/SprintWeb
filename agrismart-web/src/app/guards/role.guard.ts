import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { RoleService } from '../services/role.service';
import { RoleKey } from '../models/role.model';

export const roleGuard: CanActivateFn = (route) => {
	const authService = inject(AuthService);
	const roleService = inject(RoleService);
	const router = inject(Router);

	if (!authService.isAuthenticated()) {
		return router.createUrlTree(['/login']);
	}

	const allowedRoles = (route.data?.['roles'] as RoleKey[] | undefined) ?? [];
	if (allowedRoles.length === 0) {
		return true;
	}

	if (allowedRoles.includes(roleService.role)) {
		return true;
	}

	const fallbackRoute = roleService.role === 'admin' ? '/app/admin' : '/app/dashboard';
	return router.createUrlTree([fallbackRoute]);
};
