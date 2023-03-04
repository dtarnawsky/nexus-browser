import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: window.location.host.startsWith('capacitor.') ? 'capacitor' : 'home',
    pathMatch: 'full',
  },
  {
    path: 'privacy',
    loadChildren: () => import('./privacy/privacy.module').then((m) => m.PrivacyPageModule),
  },
  {
    path: 'capacitor',
    loadChildren: () => import('./capacitor/capacitor.module').then((m) => m.CapacitorPageModule),
  },
  {
    path: ':id',
    redirectTo: 'capacitor', // First time users get directed here
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
