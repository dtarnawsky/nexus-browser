import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CapacitorPage } from './capacitor.page';

const routes: Routes = [
  {
    path: '',
    component: CapacitorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CapacitorPageRoutingModule {}
