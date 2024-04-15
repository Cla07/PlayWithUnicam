import { HttpClient } from '@angular/common/http';
import { DebugElement, Injectable, Input } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Badge } from 'src/app/components/badge';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';

import badgesGameQuiz from 'src/app/PlayWithUnicam-Games/quiz/badges/badge.json'
import badgesGooseGame from 'src/app/PlayWithUnicam-Games/goose-game/badges/badge.json'
import badgesMemoryGame from 'src/app/PlayWithUnicam-Games/memory-game/badges/badge.json'
import badgesPixelartGame from 'src/app/PlayWithUnicam-Games/pixelart/badges/badge.json'
import badgesPercorsiGame from 'src/app/PlayWithUnicam-Games/percorsi/badges/badge.json'
import { CreaLobbyPageModule } from 'src/app/users/player/modal/crea-lobby/crea-lobby.module';
import { element } from 'protractor';


@Injectable({
  providedIn: 'root'
})


export class BadgeService {

  badgesJson: Badge[] = [];  //bagde da inserire nel db presi dal json di ogni gioco 

  badgesOnDb: Badge[] = []; //badges già presenti nel db 

  newBadges: Badge[] = [];  //nuovi badge da inserire nel database 

  private pathBadgesGame: string //percorso dei badge del gioco selezionato alla creazione 


  urlSelectedGame: string;

  idGame: any;  //id del gioco da inserire, serve per la relazione giochi badge 

  idBadge: any; //id del badge 
  listIdBadge: any[] = [];  //lista id badge  
  // listNomiBadgeOnDb: string[] = [];
  listNomiBadgeJson: string[] = [];

  /**
   * Lista dei badge di un certo gioco di un certo idGame 
   * presi da db, da giochi_badge ecc
   */
  badgesFromIdGame: Badge[] = [];

  /**
   * Lista dei badge di un certo gioco al termine di una partita 
   * (sono i badge salvati in utente_badge)
   */
  private badgesUserMatch: Badge[] = [];

  constructor(private http: HttpClient, private loginService: LoginService, private errorManager: ErrorManagerService, private loadingController: LoadingController) {

  }


  //Inserimento un badge nel db
  async createBadge(badge: Badge) {

    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}

    toSend.nome = badge.nome;
    toSend.tipo = badge.tipo;
    toSend.descrizione = badge.descrizione;

    toSend.token = tokenValue;

    this.http.post('/badge/crea', toSend).subscribe(
      async (res) => {

        this.idBadge = await res['results'][0].id; //viene restituito l'id del badge inserito e lo salvo 

        this.listIdBadge.push(await this.idBadge);   //aggiunge alla lista tutti gli id dei badge di questo gioco (serve per metterli nella tabella giochi_badge)

      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Creazione badge fallita');
      });
  }


  /*
  Ricerca id di un badge dato il suo nome 
  */
  async searchIdBadgeFromName(nome): Promise<number> {
    try {
      const tokenValue = (await this.loginService.getToken()).value;
      const headers = { 'token': tokenValue };

      const res = await this.http.get('/badge/' + nome, { headers }).toPromise();
      const idBadge: number = res['results'][0].id;  //salvo id del badge 

      return idBadge;

    } catch (error) {
      this.errorManager.stampaErrore(error, 'Impossibile cercare id del badge dato il nome !');
      throw error;
    }
  }

  /***
   * Assegnazione all'array badges, i badge del json del gioco scelto alla creazione del nuovo gioco
   * questo metodo viene eseguito alla creazione di un nuovo gioco 
   */
  readBadgesGame(urlGame: string) {
    this.urlSelectedGame = urlGame       //salvo l'url del gioco selezionato, serve per l'import del json badge corretto 

    switch (this.urlSelectedGame) {
      case '/goose-game':
        this.badgesJson = badgesGooseGame  //json del gioco (vedere import)
        break;
      case '/memory-game':
        this.badgesJson = badgesMemoryGame
        break;
      case '/quiz':
        this.badgesJson = badgesGameQuiz; //metto nell'array dei badge i badge del gioco QUIZ  

        break;
      case '/pixelart':
        this.badgesJson = badgesPixelartGame
        break;
      case '/percorsi':
        this.badgesJson = badgesPercorsiGame
        break;

      //NB: 
      //Per gli sviluppatori:
      //Se vengono creati nuovi giochi da aggiungere alla piattaforma, aggiungere gli opportuni case, con i vari import in base al gioco creato       
    }

  }
  /**
   * Inserisce tutti i badge di un gioco, letti precedentemente dal json, dopo aver controllato che già non presenti nel db 
   */

  insertBadges() {

    //controllo che i badge presenti nel db, non contengono il badge da inserire (letti dal json)
    this.controlloSePresenteBadgeOnDb();

    //inserisco i nuovi badge nel db (vengono inseriti solo quelli che già non sono presenti)

    this.newBadges.forEach(badge => {

      this.createBadge(badge);  //inserimento badge nel db 
    });


  }

  //controllo i nomi dei badge nel Json che NON sono presenti nel database e li aggiungo ai nuovi badge da inserire nel db 
  controlloSePresenteBadgeOnDb() {


    // Creazione della lista dei nomi dei badge presenti nel database
    const listNomiBadgeOnDb = this.badgesOnDb.map(badge => badge.nome);

    // Trova i nuovi badge non presenti nel database
    this.newBadges = this.badgesJson.filter(badge => !listNomiBadgeOnDb.includes(badge.nome));

  }



  /**
   * Prendo id del gioco selezionato per metterlo nella tabella giochi_badge 
   * idGame è id del gioco creato nel createGame 
   */
  async saveIdGameBadge(idGame) {
    this.idGame = idGame;
    console.log("ID GAME: " + idGame)

    this.listNomiBadgeJson = this.badgesJson.map(badge => badge.nome);   //lista di tutti i nomi dei badge dal json del gioco 


    // Ottengo gli ID dei badge
    const promises = this.listNomiBadgeJson.map(async nome => {
      return await this.searchIdBadgeFromName(nome);
    });

    try {
      // Attendo il completamento di tutte le chiamate asincrone
      const listIdBadgeOnDbFromName = await Promise.all(promises);

      // Inserimento nella tabella giochi_badge id del gioco e id del badge di quel gioco
      listIdBadgeOnDbFromName.forEach(idBadge => this.insertIDGameBadge(this.idGame, idBadge));

    } catch (error) {
      console.error('Errore durante il recupero degli ID dei badge:', error);
    }

  }


  //prendo tutti i badge nella tabella badge
  async getBadgesFromDb() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/badges', { headers })
      .subscribe(
        async (res) => {

          this.badgesOnDb = await res['results'];

        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare i badges dal database!');
        })
  }


  //prendo tutti i badge di un certo gioco
  //quindi dato l'id del gioco prendo i badge di quel gioco, viene interrogata la tabella giochi_badge, badge e giochi 
  async getBadgesFromIdGame(idGioco: any) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/badges/' + idGioco, { headers })
      .subscribe(
        async (res) => {

          this.badgesFromIdGame = await res['results'];

        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare i badges dal database!');
        })
  }


  getPathBadgesGame() {
    return this.pathBadgesGame;
  }

  getlistaBadgeFromIdGame() {
    return this.badgesFromIdGame;
  }




  //inserisce id del gioco e id del badge nella tabella giochi_badge per la relazione 
  async insertIDGameBadge(idGioco, idBadge) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}

    toSend.idGioco = idGioco;
    toSend.idBadge = idBadge;

    toSend.token = tokenValue;

    this.http.post('/giochi_badge/insert', toSend).subscribe(
      async (res) => {

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella game-badge fallito');
      });
  }

  /**
 * Inserimento nella tabella giocatore_badge, l'username dell'utente e il badge conquistato  
 * e Aggiornamento della tabella tabella reportistica con il badge conquistato 
 * @param username dell'utente
 * @param id_badge conquistato 
 * @param codice_partita codice della partita (dove è stato ottenuto badge)
 */
  async insertUserBadgeUpdateReport(username, id_badge, codice_partita) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}
    toSend.username = username;
    toSend.id_badge = id_badge;
    toSend.codice_partita = codice_partita;
    toSend.token = tokenValue;

    this.http.post('/utente_badge/insert', toSend).subscribe(
      async (res) => {

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella utente-badge fallito');
      });
  }

  /**
   * Restituisce la  lista dei badge conquistati da un giocatore 
   * @returns lista dei badge conquistati da un giocatore 
   */
  getBadgeUserMatch() {

    return this.badgesUserMatch;
  }





}  // fine classe 
