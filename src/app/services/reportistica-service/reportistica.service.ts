import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from '../login-service/login.service';
import { LoadingController } from '@ionic/angular';
import { ErrorManagerService } from '../error-manager/error-manager.service';
import { Reportistica } from 'src/app/components/reportistica';
import { BehaviorSubject } from 'rxjs';
import { Badge } from 'src/app/components/badge';
import { Skill } from 'src/app/components/skill';

@Injectable({
  providedIn: 'root'
})
export class ReportisticaService {

  /**
   * Reportistica di un certo giocatore e con lo stesso id gioco 
   */
  private reportUserIdGame: Reportistica[] = []

/**
 * Reportistiche di un istanza di gioco 
 */
  private reportIdGame: Reportistica[] = []


  /**
   *  Numero di righe dalla reportistica dello stesso utente e stessa categoria di gioco
   */
  numReportisticheUserCateg: any
  numeroPartite: any;


  //serve per trasferire il nome della materia verso il create game, perchè altrimenti non verrebbe restituito subito essemdo una chaimata asincrona
  private numeroPartiteGiocatoreSubject : BehaviorSubject <number> = new BehaviorSubject<number>(null);
  numeroPartiteGiocatore$ = this.numeroPartiteGiocatoreSubject.asObservable()
  

  constructor(
    private http: HttpClient, private loginService: LoginService, private loadingController: LoadingController,private errorManager: ErrorManagerService) {

     }


  //Creazione Reportistica (Inserimento record reportistica nel db)
  async creaReportistica(username: string,cod_partita:string,id_gioco,score:number,answers:number,time:number,badges:any,skills:any) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {};

    toSend.username = username;
    toSend.cod_partita = cod_partita;
    toSend.id_gioco = id_gioco;
    toSend.score = score;
    toSend.answers = answers;  //risposte totali 
    toSend.time = time;
    toSend.badges = badges;
    toSend.skills = skills;
    toSend.token = tokenValue;

    this.http.post('/reportistica/crea', toSend).subscribe(
      async (res) => {

        //salvare i dati che mi serve, in arrivo da api 
    
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella reportistica fallito');
      });
  }

  /**
   * Reportistica di un certo giocatore dove idGioco è lo stesso 
   * (serrve ad esempio per contare le partite che fa un certo giocatore o altro)
   */
  async getReportisticaUserIdGame(username, id_gioco){

    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };
  
    this.http.get('/reportistica/'+username+'/' + id_gioco, { headers })
      .subscribe(
        async (res) => {
        this.reportUserIdGame = await res['results'];  
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare reportistica di un giocatore e con stesso id gioco!');
        })
  }
    

  /**
   * Reportistica di tutti i giocatori dove idGioco è lo stesso 
   * @param id_gioco id del gioco cui prendere la reportistica 
   */
  async getReportisticaIdGame(id_gioco){

    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };
  
    this.http.get('/reportistica/'+ id_gioco, { headers })
      .subscribe(
        async (res) => {
        this.reportIdGame = await res['results'];  
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare reportistica di un certo gioco!');
        })
  }


 /**
  * Restituisce il numero delle partite di un giocatore 
  * @param username username del giocatore 
  * @param categoria categoria del gioco 
  * @returns 
  */

async getReportUserCategoria(username, categoria): Promise<number> {
  const tokenValue = (await this.loginService.getToken()).value;
  const headers = {'token': tokenValue };

  try {
    const res = await this.http.get('/num/report/' + username + '/' + categoria, { headers }).toPromise();
    const numPartite: number = res['results'][0].count;
    return numPartite;
  } catch (error) {
    this.errorManager.stampaErrore(error, 'Impossibile caricare numero partite da reportistica!');
    throw error;
  }
}


getNumeroPartiteProva(){
  return this.numeroPartite
}

  /**
 * @returns Numero di reportistiche dello stesso user e categoria 
 * (ad esempio per contare il numero di partite di un giocatore dove la categorua del gioco è la stessa)
 */
  public getNumReportisticheUserCateg(): any{
    return this.numReportisticheUserCateg
}


/**
 * @returns Reportistica dello stesso user e id game 
 */
  public getReportUserIdGame(): any{
      return this.reportUserIdGame
  }
/**
 * 
 * @returns Reportistiche dello stesso id game 
 */
  public getReportIdGame(): any{
    return this.reportIdGame
}


/**
 * Aggiorno la reportistica con i badge e skill conquistati dal giocatore
 * @param username username del giocatore 
 * @param cod_partita codice della partita dove ha conquistato il badge 
 * @param badges badges conquistati 
 * @param skills skills conquistate 
 */
async aggiornaReportistica(username: any, cod_partita: any, badges: any, skills: any) {
  const tokenValue = (await this.loginService.getToken()).value;
  
  const nomiBadge = badges.map(badge => badge.nome);   //prendo solo i nomi dei badge 

  const nomiSkill = skills.map(skill => skill.nome);  //prendo solo i nomi delle skill 

    const toSend: any = {
      'token': tokenValue,
      'badges': nomiBadge,
      'skills': nomiSkill,
      'username': username,
      'cod_partita': cod_partita,
    }

    this.http.put('/report/update', toSend).subscribe(
      async (res) => { },
      async (res) => {   this.errorManager.stampaErrore(res, 'Impossibile aggiornare la reportistica !'); }
    )
}

}
