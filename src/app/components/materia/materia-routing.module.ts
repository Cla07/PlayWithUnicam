import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MateriaComponent } from './materia.component';

const routes: Routes = [
    {
        path: '',
        component: MateriaComponent
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MateriaRoutingModule { }
