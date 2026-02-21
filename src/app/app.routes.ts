import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // File routes ini ada di src/app/, jadi path ke home cukup ./home/home.page
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
  },
];