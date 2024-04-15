import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditMateriaCategoriaComponent } from './edit-materia-categoria.component';

const routes: Routes = [
  {
    path: '',
    component: EditMateriaCategoriaComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EditMateriaCategoriaRoutingModule { }
