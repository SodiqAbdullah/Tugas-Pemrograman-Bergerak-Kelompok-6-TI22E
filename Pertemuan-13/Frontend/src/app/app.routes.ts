import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.page').then(m => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.page').then(m => m.RegisterPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.page').then(m => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'riwayat',
    loadComponent: () =>
      import('./riwayat/riwayat.page').then(m => m.RiwayatPage),
    canActivate: [AuthGuard],
  },
];