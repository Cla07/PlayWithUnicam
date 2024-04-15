import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, ModalController, NavParams } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { EditorItem } from '../../components/editor-container/editor-item';
import { GameEditorService } from '../../services/game-editor/game-editor.service';
import { MateriaService } from '../../services/materia-service/materia.service';
import { Subscription } from 'rxjs';
import { MateriaComponent } from 'src/app/components/materia/materia.component';
import { CategoriaComponent } from 'src/app/components/categoria/categoria.component';
import { CategoriaService } from '../../services/categoria-service/categoria.service';

@Component({
  selector: 'app-edit-game',
  templateUrl: './edit-game.page.html',
  styleUrls: ['./edit-game.page.scss'],
})
export class EditGamePage implements OnInit {
  segment: string = "info";
  data: FormGroup;
  attivo = true;
  regolamento: string = "";
  editorItem: EditorItem;

  @Input() game: any;

  id_materia: any;
  nomeMateriaProva: string;
  private subscriptionNomeMateria: Subscription;
  nomeMateria: string;
  idMateriaScelta: number;
  idMateriaInserita: number;


  id_categoria: any;
  nomeCategoriaProva: string;
  private subscriptionNomeCategoria: Subscription;
  nomeCategoria: string;
  idCategoriaScelta: number;
  idCategoriaInserita: number;


  controllo: boolean;
  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private navParams: NavParams,
    private gameEditorService: GameEditorService,
    private materiaService: MateriaService,
    private categoriaService: CategoriaService) {
  }

  async ngOnInit() {
    this.game = this.navParams.get('game');

    if (this.game.config)
      this.editorItem = this.gameEditorService.getProperEditor(this.game.config);

    this.data = this.fb.group({
      nome: [this.game.nome],
      attivo: [this.game.attivo],
    });

    if (this.game.regolamento) {
      this.regolamento = this.game.regolamento;
    }
    //MATERIA 

    this.materiaService.getListaMaterie();  //carico le materie da db e le salvo in materie del materiaService     

    this.id_materia = this.game.id_materia; //prendo id materia assegnata al gioco nella create-game 

    this.materiaService.getNomeMateriaFromId(this.id_materia);

    this.subscriptionNomeMateria = this.materiaService.nomeMateriaProva$.subscribe((nomeMat) => {
      this.nomeMateria = nomeMat;
    });


    this.categoriaService.getListaCategorie();

    this.id_categoria = this.game.id_categoria;

    this.categoriaService.getNomeCategoriaFromId(this.id_categoria);

    //per trasferire il nome della categoria modificato nella modale, verso la pagina di edit 
    this.subscriptionNomeCategoria = this.categoriaService.nomeCategoriaProva$.subscribe((nomeCat) => {
      this.nomeCategoria = nomeCat;
    })

  }


  async apriModaleMateria() {
    this.materiaService.setModalType('modificaGioco')
    const modal = await this.modalController.create({
      component: MateriaComponent,
      cssClass: 'fullscreen'
    });
    modal.onDidDismiss().then((materia) => {

      //salvo il nome della materia creata  
      this.nomeMateria = this.materiaService.getNomeMateria();


    });

    return await modal.present();
  }


  async apriModaleCategoria() {
    this.categoriaService.setModalType('modificaGioco')

    const modal = await this.modalController.create({
      component: CategoriaComponent,
      cssClass: 'fullscreen'
    });
    modal.onDidDismiss().then((categoria) => {
      if (categoria !== null) {
        const categoriaSceltaz = categoria.data

        const idCategoriaSceltaz = categoria['data']

        console.log('Categoria scelta alla chiusura della modale' + categoriaSceltaz)
      }
      //salvo il nome della categ creata  
      this.nomeCategoria = this.categoriaService.getNomeCategoria();
    });
    return await modal.present();
  }


  updateConfig(newConfig: Object) {
    this.game.config = newConfig;
  }
  ngOnDestroy() {
    this.subscriptionNomeMateria.unsubscribe();
    this.subscriptionNomeCategoria.unsubscribe();
  }
  /**
   * Chiude la Modal.
   */
  async closeModal() {
    this.modalController.dismiss();
  }

  async deleteGame() {
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare questo gioco?", async () => {
      this.delete();
    });
  }

  //TODO commentare
  async delete() {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = { 'token': tokenValue, 'game': String(this.game.id) };

    this.http.delete('/admin/game', { headers }).subscribe(
      async (res) => {
        this.modalController.dismiss(true);
        loading.dismiss();
        this.alertCreator.createInfoAlert("Eliminazione completata", "Il gioco '" + this.game.nome + "' è stato eliminato con successo!");
      },
      async (res) => {
        this.modalController.dismiss(true);
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Eliminazione fallita');
      });
  }

  //TODO commentare
  async salvaModifiche() {
    if (this.controllaCampi()) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;
      var toSend = this.data.value;
      toSend.id = this.game.id;
      toSend.regolamento = this.regolamento;
      toSend.config = this.game.config;

      toSend.minGiocatori = this.game.min_giocatori;
      toSend.maxGiocatori = this.game.max_giocatori;
      toSend.tipo = this.game.tipo;
      toSend.link = this.game.link;


      //prendo id della materia scelta o inserita (creata nuova) dal service 
      this.idMateriaScelta = this.materiaService.getIdMateriaFromSelect();
      this.idMateriaInserita = this.materiaService.getIdMateriaInserita();
      if (this.idMateriaScelta) {
        toSend.id_materia = this.idMateriaScelta
      }
      else if (this.idMateriaInserita) {
        toSend.id_materia = this.idMateriaInserita
      }
      //se non è stata modificata, prendo quella già presente nel gioco 
      else {
        toSend.id_materia = this.game.id_materia
      }

      //prendo id della categoria scelta o inserita (creata nuova) dal service 
      this.idCategoriaScelta = this.categoriaService.getIdCategoriaFromSelect();
      this.idCategoriaInserita = this.categoriaService.getIdCategoriaInserita();
      if (this.idCategoriaScelta) {
        toSend.id_categoria = this.idCategoriaScelta
      }
      else if (this.idCategoriaInserita) {
        toSend.id_categoria = this.idCategoriaInserita
      }
      else { //se non è stata modificata, prendo quella già presente nel gioco 
        toSend.id_categoria = this.game.id_categoria
      }
      
      toSend.token = tokenValue;

      this.http.put('/game/modifica', toSend).subscribe(
        async (res) => {
          this.modalController.dismiss(true);
          loading.dismiss();
          this.alertCreator.createInfoAlert("Modifica completata", "Il gioco è stato modificato con successo!");
        },
        async (res) => {
          this.modalController.dismiss();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica fallita');
        });
    }
  }

  controllaCampi() {
    if (this.data.value.minGiocatori < 1 || this.data.value.maxGiocatori < 1) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero dei giocatori non può essere negativo!');
      return false;
    }
    if (this.data.value.minGiocatori > this.data.value.maxGiocatori) {
      this.alertCreator.createInfoAlert('Errore nei dati', 'Il numero minimo dei giocatori non può essere maggiore del numero massimo!');
      return false;
    }
    return true;
  }
}
