import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinkPage } from './link.page';

const routes: Routes = [
  {
    path: '',
    component: LinkPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LinkPageRoutingModule {}
