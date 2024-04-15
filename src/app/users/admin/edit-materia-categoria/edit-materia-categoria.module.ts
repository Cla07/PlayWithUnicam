import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EditMateriaCategoriaRoutingModule } from './edit-materia-categoria-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EditMateriaCategoriaComponent } from './edit-materia-categoria.component';


@NgModule({
  declarations: [EditMateriaCategoriaComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    EditMateriaCategoriaRoutingModule
  ]
})
export class EditMateriaCategoriaModule { }
