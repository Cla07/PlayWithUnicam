import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { Game } from 'src/app/components/game';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { GameEditorService } from '../../services/game-editor/game-editor.service';
import { Materia } from 'src/app/components/materia';
import { MateriaService } from '../../services/materia-service/materia.service';
import { MateriaComponent } from 'src/app/components/materia/materia.component';
import { MateriaModule } from 'src/app/components/materia/materia.module';
import { Subscription } from 'rxjs';
import { CategoriaService } from '../../services/categoria-service/categoria.service';
import { CategoriaComponent } from 'src/app/components/categoria/categoria.component';
import { Badge } from 'src/app/components/badge';
import { BadgeService } from '../../services/badge-service/badge.service';
import { SkillService } from '../../services/skill-service/skill.service';


@Component({
  selector: 'app-create-game',
  templateUrl: './create-game.page.html',
  styleUrls: ['./create-game.page.scss'],
})
export class CreateGamePage implements OnInit {
  games: Game[] = [];
  data: FormGroup;
  selectedGame: Game;
  materie: Materia[] = [];   //salvo le materie da API (materiaService)

  idMateriaScelta: number;   //ID MATERIA scelta o selezionata nel componente Materia 
  idMateriaInserita: number;
  nomeMateria: string

  idCategoriaScelta: number;
  idCategoriaInserita: number;
  nomeCategoria: string
  pathBadgesGame: string;
  idNewGame: any;
  idGame: any;
  nameGameSelected: any;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private loadingController: LoadingController,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private modalCtrl: ModalController,
    private gameEditorService: GameEditorService,
    private materiaService: MateriaService,
    private categoriaService: CategoriaService,
    private badgeService: BadgeService,
    private skillService: SkillService,
    private modalController: ModalController) {
    this.games = this.gameEditorService.getGames();

    //serviva per salvare il nome della materia, ma messa alla chiusura della modale materia 
    //  this.materiaInserita = this.materiaService.getNuovaMateriaObservable().subscribe((mat: string)=> this.nomeNuovaMateria = mat)


  }

  ngOnInit() {
    this.data = this.fb.group({
      name: ['', Validators.required],
    });

    this.materiaService.getListaMaterie();  //carico le materie da db e le salvo in materie del materiaService     
    this.categoriaService.getListaCategorie();


    this.badgeService.getBadgesFromDb()  //carico i badge del db 

    this.skillService.getSkillsFromDb() //carico le skill dal db 
  }

  //passare qui id del badge se nellla create non funziona 
  ngOnDestroy() {
    this.saveIdGameBadge()
    this.saveIdGameSkill()
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  selectGame(game: Game) {
    this.selectedGame = game;
  }

  /**
   * Dopo aver controllato i campi effettua la chiamata REST per creare il nuovo
   * gioco secondo i dati inseriti dall'utente.
   */
  async creaGioco() {
    if (this.selectedGame && this.data.value.name) {
      const loading = await this.loadingController.create();
      await loading.present();

      const tokenValue = (await this.loginService.getToken()).value;

      //BADGE
      //invio al service l'url del game selected e assegno all'array i badge (presi dal json) di tale gioco
      this.badgeService.readBadgesGame(this.selectedGame.getUrl())
      //inserisce i badge nel database, letti precedemente dal json del gioco e controllo che tali badge non sono già presenti 
      this.badgeService.insertBadges();
      //stessa cosa per le SKILL
      this.skillService.readSkillsGame(this.selectedGame.getUrl())
      //inserisce i badge nel database, letti precedemente dal json del gioco e controllo che tali badge non sono già presenti 
      this.skillService.insertSkills();

      var toSend: any = {};
      toSend.nome = this.data.value.name;
      toSend.tipo = this.selectedGame.getType();
      toSend.minGiocatori = this.selectedGame.getMinPlayers();
      toSend.maxGiocatori = this.selectedGame.getMaxPlayers();
      toSend.link = this.selectedGame.getUrl();
      toSend.attivo = false;
      toSend.config = this.selectedGame.getConfig();
      toSend.regolamento = null;

      //1. Se la materia selezionata è presente 
      this.idMateriaScelta = this.materiaService.getIdMateriaFromSelect();
      if (this.idMateriaScelta) {
        toSend.id_materia = this.idMateriaScelta
      }
      this.idMateriaInserita = this.materiaService.getIdMateriaInserita();
      if (this.idMateriaInserita) {
        toSend.id_materia = this.idMateriaInserita
      }

      this.idCategoriaScelta = this.categoriaService.getIdCategoriaFromSelect();
      if (this.idCategoriaScelta) {
        toSend.id_categoria = this.idCategoriaScelta
      }
      this.idCategoriaInserita = this.categoriaService.getIdCategoriaInserita();
      if (this.idCategoriaInserita) {
        toSend.id_categoria = this.idCategoriaInserita
      }

      toSend.token = tokenValue;

      this.nameGameSelected = toSend.nome;  //cla 

      this.http.post('/game/crea', toSend).subscribe(
        async (res) => {
          this.data.reset();
          this.alertCreator.createInfoAlert('Gioco creato', 'Il gioco è stato creato con successo.');
          await loading.dismiss();
          this.modalCtrl.dismiss(true);
        },
        async (res) => {
          this.data.reset();
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Creazione gioco fallita');
        });
    } else this.alertCreator.createInfoAlert('Errore!', 'Compila tutti i campi!');
  }

  /**
   * Permette di cercare id del gioco dato il suo nome 
   *  */
  async searchIdGameFromName(nome): Promise<any> {
    try {
      const tokenValue = (await this.loginService.getToken()).value;
      const headers = { 'token': tokenValue };

      const res = await this.http.get('/gioco/' + nome, { headers }).toPromise();
      return res['results'][0].id;
    } catch (error) {
      this.errorManager.stampaErrore(error, 'Impossibile cercare id del gioco dato il nome !');
      throw error; // Rilancia l'errore per gestirlo al di fuori di questa funzione se necessario
    }
  }

  async saveIdGameBadge() {
    this.idGame = await this.searchIdGameFromName(this.nameGameSelected);    //salvo id dell'ultimo gioco creato  //this.data.value.name
    this.badgeService.saveIdGameBadge(this.idGame);  //inserisco nella tabella giochi_badge id del gioco e id del badge 
  }


  async saveIdGameSkill() {
    this.idGame = await this.searchIdGameFromName(this.nameGameSelected);    //salvo id dell'ultimo gioco creato  //this.data.value.name
    this.skillService.saveIdGameSkill(this.idGame);  //inserisco nella tabella giochi_badge id del gioco e id del badge 
  }

  //----MATERIA----

  //Prendo l'id della materia SCLETA dall'utente nella modale materia 
  getIdMateria() {
    this.idMateriaScelta = this.materiaService.getIdMateriaFromSelect();
    console.log("ID MATERIA SCELTA NELLA MODALE: " + this.idMateriaScelta)
  }



  getIdMateriaInseritaDalService() {
    this.idMateriaScelta = this.materiaService.getIdMateriaInserita();
    console.log("Sono in crea game: " + this.idMateriaScelta)
  }

  /**
    * Apre la modale della materia 
    * @returns presenta la modal
    */

  async apriModaleMateria() {
    this.materiaService.setModalType('creaGioco')
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


  //----Categoria----

  //Prendo l'id della categoria SCELTA dall'utente nella modale CATEGORIA 
  getIdCategoria() {
    this.idCategoriaScelta = this.categoriaService.getIdCategoriaFromSelect();
  }



  getIdCategoriaInseritaDalService() {
    this.idCategoriaScelta = this.categoriaService.getIdCategoriaInserita();
  }

  /**
    * Apre la modale della categoria 
    * @returns presenta la modal
    */

  async apriModaleCategoria() {
    this.categoriaService.setModalType('creaGioco')
    const modal = await this.modalController.create({
      component: CategoriaComponent,
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((categoria) => {

      //salvo il nome della materia creata  
      this.nomeCategoria = this.categoriaService.getNomeCategoria();

    });
    return await modal.present();
  }


}


