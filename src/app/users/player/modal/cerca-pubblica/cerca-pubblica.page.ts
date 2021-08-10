import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

@Component({
  selector: 'app-cerca-pubblica',
  templateUrl: './cerca-pubblica.page.html',
  styleUrls: ['./cerca-pubblica.page.scss'],
})
export class CercaPubblicaPage implements OnInit {
  lobbies = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private loadingController: LoadingController,
    private loginService: LoginService,
    private modalController: ModalController,
    private errorManager: ErrorManagerService
  ) {
    this.loadLobby();
  }

  ngOnInit() {
  }

  async closeModal() {
    this.modalController.dismiss();
  }

  async loadLobby() {
    const token_value = (await this.loginService.getToken()).value;
    const headers = { 'token': token_value };

    this.http.get('/lobby/pubbliche', { headers }).subscribe(
      async (res) => {
        this.lobbies = res['results'];
        //TODO
        // this.reloadManager.completaReload(event);
      },
      async (res) => {
        //TODO:gestione stampa errore
        this.errorManager.stampaErrore(res, 'Impossibile caricare le Lobby!');
        // this.reloadManager.completaReload(event);
      });
  }

  //TODO commentare
  async partecipa(lobby) {
    console.log(lobby);

    const loading = await this.loadingController.create();
    await loading.present();

    const token_value = (await this.loginService.getToken()).value;

    const toSend = {
      token: token_value,
      codice_lobby: lobby.codice
    }

    return this.http.post('/lobby/partecipa', toSend).pipe(
      map((data: any) => data.esito),
      switchMap(esito => { return esito; })).subscribe(
        async (res) => {
          this.modalController.dismiss();
          this.router.navigateByUrl('/lobby-guest', { replaceUrl: true });
          await loading.dismiss();
        },
        async (res) => {
          await loading.dismiss();
          this.modalController.dismiss();
          this.errorManager.stampaErrore(res, 'Creazione Lobby fallita');
        });
  }
}
