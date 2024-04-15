import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Output } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Materia } from 'src/app/components/materia';
import { MateriaComponent } from 'src/app/components/materia/materia.component';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EventEmitter } from 'stream';

@Injectable({
  providedIn: 'root'
})
export class MateriaService {


  private materie: Materia[] = []

  modalType: string = '';  //tipo di modale (se aperta alla creazione del gioco o alla modifica del gioco)

  idMateriaScelta: number;
  idMateriaInserita: number;
  nomeMateria: string;

  private nomeMateriaFromId: string;

  private materiaInseritaProva: string;

  //serve per trasferire il nome della materia verso il create game, perchè altrimenti non verrebbe restituito subito essemdo una chaimata asincrona
  private nomeMateriaProvaSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  nomeMateriaProva$ = this.nomeMateriaProvaSubject.asObservable()

  private isDeleteMateria = false;

  constructor(private http: HttpClient, private loginService: LoginService, private loadingController: LoadingController, private errorManager: ErrorManagerService) {

  }


  setModalType(type: string) {
    this.modalType = type;
  }

  getModalType() {
    return this.modalType
  }

  /**
   * Restituisce tutte le materie del database 
   */
  async getListaMaterie() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };


    this.http.get('/materie', { headers })
      .subscribe(
        async (res) => {  

          this.materie = await res['results'];
         
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare le materie!');
        })
  }


  getMateriaInseritaProva(): string {
    return this.materiaInseritaProva;
  }


  getMaterie() {
   
    return this.materie;
  }

  //Salvo l'id della materia scelta dall'utente nel form della materia (materiaComponent)
  public setIdMateriaFromSelect(id: number) {
    this.idMateriaScelta = id
  }

  //Restituisce id della materia SCELTA  dall'utente nella dropdown 

  public getIdMateriaFromSelect(): number {
    return this.idMateriaScelta;
  }


  public setNomeMateria(nome: string) {
    this.nomeMateria = nome;
  }


  public getNomeMateria(): string {
    return this.nomeMateria;
  }


  public getNomeMateriaProva(): string {
    return this.nomeMateriaFromId;
  }

  //Restituisce id della materia SCELTA  dall'utente nella dropdown 

  public getIdMateriaInserita(): number {
    return this.idMateriaInserita;
  }

  public getIsDelete() {
    console.log("Controllo nel service: " + this.isDeleteMateria)
    return this.isDeleteMateria;
  }

  //Creazione materia (Inserimento materia nel db)
  async creaMateria(nome) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {};

    toSend.nome = nome;
    toSend.token = tokenValue;

    this.http.post('/materia/crea', toSend).subscribe(
      async (res) => {
        this.nomeMateria = nome;

        this.idMateriaInserita = await res['results'][0].id; //viene restituito l'id della materia inserita e la salvo 

        this.materie = this.materie.concat(new Materia(this.idMateriaInserita, this.nomeMateria)); //aggiungo la nuova materia 

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Creazione materia fallita');
      });
  }


  /**
   * Eliminazione materia 
   * @param nome nome della materia da eliminare 
   * @returns 
   */
  async eliminaMateria(nome) {

    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = {
      'token': tokenValue,
      'nome': nome
    }

    return this.http.delete('/elimina/mat', { headers }).subscribe(
      async (res) => {
        const nomeMateriaEliminare = nome;
        for (let i = 0; i < this.materie.length; i++) {
          if (this.materie[i].nome == nomeMateriaEliminare)
            this.materie.splice(i, 1)
        }
        this.isDeleteMateria = true;
        //  this.nomeMateriaProvaSubject.next(this.ma)
        loading.dismiss();
        //    this.modalController.dismiss(true);
      },
      async (res) => {
        loading.dismiss();
        this.errorManager.stampaErrore(res, 'eliminazione materia fallita');
      });
  }

  async getNomeMateriaFromId(id: number) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/materia/' + id, { headers })
      .subscribe(
        async (res) => {

          //   this.nomeMateria = await res['results'][0].nome;
          this.nomeMateriaFromId = await res['results'][0].nome;
          this.nomeMateriaProvaSubject.next(this.nomeMateriaFromId)
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare nome della materia!');
        })
  }


  /**
   * Prende il nome della materia dato l'id della materia 
   * NB fa la stessa cosa del metodo getNomeMateriaFromId, ma questo viene usato in dashboard per ricercare la materia 
   * preferito separarli per lavorare su variabili diverse e non interferire 
   * @param materiaId 
   * @returns 
   */
  async getMateriaNameById(materiaId: number): Promise<string> {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    try {
      const res = await this.http.get('/cercamateria/' + materiaId, { headers }).toPromise();
      return res['results'][0].nome;
    } catch (error) {
      this.errorManager.stampaErrore(error, 'Impossibile caricare nome della materia!');
      throw error; // Rilancia l'errore per gestione ulteriore, se necessario
    }
  }

}
