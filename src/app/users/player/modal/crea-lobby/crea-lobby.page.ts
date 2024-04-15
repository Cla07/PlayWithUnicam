import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { BadgeService } from 'src/app/users/admin/services/badge-service/badge.service';

@Component({
  selector: 'app-crea-lobby',
  templateUrl: './crea-lobby.page.html',
  styleUrls: ['./crea-lobby.page.scss'],
})
export class CreaLobbyPage implements OnInit {
  @Input() giocoSelezionato;
  tipo = true;

  constructor(
    private http: HttpClient,
    private router: Router,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private badgeService: BadgeService
  ) { }

  ngOnInit() {
   }

  /**
   * Chiude la Modal.
   */
  async closeModal() {
    this.modalController.dismiss();
  }

  /**
   * Crea una nuova Lobby.
   */
  async creaLobby() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.loginService.getToken()).value;

    const toSend = {
      token: tokenValue,
      idGioco: this.giocoSelezionato.id,
      pubblica: this.tipo
    }

    this.http.post('/lobby', toSend).subscribe(
      async (res) => {
        var message = "La lobby è stata creata, ora è possibile iniziare a giocare.";
        this.alertCreator.createInfoAlert('Lobby creata', message);
        this.modalController.dismiss();
        this.router.navigateByUrl('/lobby-admin', { replaceUrl: true });
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.modalController.dismiss();
        this.errorManager.stampaErrore(res, 'Creazione lobby fallita');
      });
  }

}