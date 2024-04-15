import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportisticaComponent } from './reportistica.component';
import { ReportisticaGameComponent } from './reportistica-game/reportistica-game.component';

const routes: Routes = [

  {
    path: '', 
    component: ReportisticaComponent 
  },
  {
    path: ':nomeGioco',  //reportistica del gioco selezionato 
    component: ReportisticaGameComponent 
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportisticaRoutingModule { }
