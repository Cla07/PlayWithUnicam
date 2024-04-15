import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportisticaRoutingModule } from './reportistica-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IntroLobbyComponentModule } from '../../player/popover/intro-lobby-popover/intro-lobby-popover.module';
import { UserPopoverComponentModule } from 'src/app/components/user-popover/user-popover.module';
import { SwiperModule } from 'swiper/angular';
import { CreateGamePageModule } from '../modal-pages/create-game/create-game.module';
import { ReportisticaComponent } from './reportistica.component';
import { ReportisticaGameComponent } from './reportistica-game/reportistica-game.component';

@NgModule({
  declarations: [ReportisticaComponent, ReportisticaGameComponent],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportisticaRoutingModule,
    IntroLobbyComponentModule,
    UserPopoverComponentModule,
    SwiperModule,
    CreateGamePageModule,

  ]
})
export class ReportisticaModule { }
