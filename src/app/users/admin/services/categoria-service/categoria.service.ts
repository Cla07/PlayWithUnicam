import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Output } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Categoria } from 'src/app/components/categoria';
import { CategoriaComponent } from 'src/app/components/categoria/categoria.component';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EventEmitter } from 'stream';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {


  private categorie: Categoria[] = []

  modalType: string = '';  //tipo di modale (se aperta alla creazione del gioco o alla modifica del gioco)

  idCategoriaScelta: number;
  idCategoriaInserita: number;
  nomeCategoria: string;

  private nomeCategoriaFromId: string;

  private categoriaInseritaProva: string;

  //serve per trasferire il nome della categoria verso il create game, perchè altrimenti non verrebbe restituito subito essemdo una chiamata asincrona
  private nomeCategoriaProvaSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  nomeCategoriaProva$ = this.nomeCategoriaProvaSubject.asObservable()

  private isDeleteCategoria = false;

  constructor(private http: HttpClient, private loginService: LoginService, private loadingController: LoadingController, private errorManager: ErrorManagerService) {

  }


  setModalType(type: string) {
    this.modalType = type;
  }

  getModalType() {
    return this.modalType
  }


  async getListaCategorie() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };


    this.http.get('/categorie', { headers })
      .subscribe(
        async (res) => {

          this.categorie = await res['results'];
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare le categorie!');
        })
  }


  getCategoriaInseritaProva(): string {
    return this.categoriaInseritaProva;
  }


  getCategorie() {
    return this.categorie;
  }

  //Salvo l'id della categoria scelta dall'utente nel form della categoria (categoriaComponent)
  public setIdCategoriaFromSelect(id: number) {
    this.idCategoriaScelta = id
  }

  //Restituisce id della categoria SCELTA  dall'utente nella dropdown 

  public getIdCategoriaFromSelect(): number {
    return this.idCategoriaScelta;
  }


  public setNomeCategoria(nome: string) {
    this.nomeCategoria = nome;
  }


  public getNomeCategoria(): string {
    return this.nomeCategoria;
  }


  public getNomeCategoriaProva(): string {
    return this.nomeCategoriaFromId;
  }

  //Restituisce id della categoria SCELTA  dall'utente nella dropdown 

  public getIdCategoriaInserita(): number {
    return this.idCategoriaInserita;
  }

  public getIsDelete() {
    return this.isDeleteCategoria;
  }

  //Creazione categoria (Inserimento categoria nel db)
  async creaCategoria(nome) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {};

    toSend.nome = nome;
    toSend.token = tokenValue;

    this.http.post('/categoria/crea', toSend).subscribe(
      async (res) => {
        this.nomeCategoria = nome;

        this.idCategoriaInserita = await res['results'][0].id; //viene restituito l'id della categoria inserita e la salvo 

        this.categorie = this.categorie.concat(new Categoria(this.idCategoriaInserita, this.nomeCategoria)); //aggiungo la nuova categoria 


        //    this.nuovaCategoriaSubject.next(nome);
        //     this.nomeNuovaCategoriaInserita.emit(nome);
        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Creazione categoria fallita');
      });
  }



  async eliminaCategoria(nome) {

    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = {
      'token': tokenValue,
      'nome': nome
    }

    return this.http.delete('/elimina/categoria', { headers }).subscribe(
      async (res) => {
        const nomeCategoriaEliminare = nome;
        for (let i = 0; i < this.categorie.length; i++) {
          if (this.categorie[i].nome == nomeCategoriaEliminare)
            this.categorie.splice(i, 1)
        }
        this.isDeleteCategoria = true;
        loading.dismiss();
      },
      async (res) => {
        loading.dismiss();
        this.errorManager.stampaErrore(res, 'eliminazione categoria fallita');
      });
  }

  async getNomeCategoriaFromId(id: number) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/categoria/' + id, { headers })
      .subscribe(
        async (res) => {

          //   this.nomeCategoria = await res['results'][0].nome;
          this.nomeCategoriaFromId = await res['results'][0].nome;
          this.nomeCategoriaProvaSubject.next(this.nomeCategoriaFromId)
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare nome della categoria!');
        })
  }


  /**
 * Prende il nome della materia dato l'id della materia 
 * NB fa la stessa cosa del metodo getNomecategoriaFromId, ma questo viene usato in dashboard per ricercare la categoria 
 * preferito separarli per lavorare su variabili diverse
 * @param materiaId 
 * @returns nome della categoria 
 */
  async getCategoryNameById(id: number): Promise<string> {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    try {
      const res = await this.http.get('/cercacategoria/' + id, { headers }).toPromise();
      return res['results'][0].nome;
    } catch (error) {
      this.errorManager.stampaErrore(error, 'Impossibile caricare nome della categoria!');
      throw error;
    }
  }

}

