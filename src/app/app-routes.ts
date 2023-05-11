import {  Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(c => c.HomePage),
  },
  {
    path: '',
    redirectTo: window.location.host.startsWith('capacitor.') ? 'capacitor' : 'home',
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    loadComponent: () => import('./privacy/privacy.page').then(c => c.PrivacyPage),
  },
  {
    path: 'capacitor',
    loadComponent: () => import('./capacitor/capacitor.page').then(c => c.CapacitorPage),
  },
  {
    path: ':id',
    redirectTo: 'capacitor', // First time users get directed here
    pathMatch: 'full',
  },
];
