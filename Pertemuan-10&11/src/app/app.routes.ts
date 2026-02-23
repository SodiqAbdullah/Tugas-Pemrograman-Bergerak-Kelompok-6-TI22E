import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    // Perhatikan bagian /:id -> ini adalah parameter dinamis
    path: 'detail/:id',
    loadComponent: () => import('./detail/detail.page').then( m => m.DetailPage)
  },  {
    path: 'tambah-mhs',
    loadComponent: () => import('./tambah-mhs/tambah-mhs.page').then( m => m.TambahMhsPage)
  },

];
