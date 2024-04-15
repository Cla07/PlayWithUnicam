import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CreateGamePageRoutingModule } from './create-game-routing.module';

import { CreateGamePage } from './create-game.page';
import { EditGamePageModule } from '../edit-game/edit-game.module';
import { MateriaModule } from 'src/app/components/materia/materia.module';
import { MateriaComponent } from 'src/app/components/materia/materia.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateGamePageRoutingModule,
    EditGamePageModule,
  ],
  declarations: [CreateGamePage]  
})
export class CreateGamePageModule { }
