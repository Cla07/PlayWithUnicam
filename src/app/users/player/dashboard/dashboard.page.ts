import { HttpClient } from '@angular/common/http';
import { AfterContentChecked, Component, NgZone, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { IntroLobbyPopoverComponent } from '../popover/intro-lobby-popover/intro-lobby-popover.component';
import Swiper, { SwiperOptions, Pagination, Navigation } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { CreateGamePage } from '../../admin/modal-pages/create-game/create-game.page';
import { MateriaService } from '../../admin/services/materia-service/materia.service';
import { CategoriaService } from '../../admin/services/categoria-service/categoria.service';
import { Badge } from 'src/app/components/badge';
import { Router } from '@angular/router';
import { ReportisticaService } from 'src/app/services/reportistica-service/reportistica.service';
import { Subscription, from } from 'rxjs';
import { Game } from 'src/app/components/game';
Swiper.use([Pagination, Navigation]);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit, AfterContentChecked {
  games = [];
  tipoUtente: string;
  listaUrlGame: string[] = new Array<string>();
  badges = [];
  badgesDalJson: any;
  breakpoints = {
    420: { slidesPerView: 1.5, spaceBetween: 20 },
    550: { slidesPerView: 2.2, spaceBetween: 20 },
    768: { slidesPerView: 2.6, spaceBetween: 40 },
    1024: { slidesPerView: 3.6, spaceBetween: 40 }
  }


  @ViewChild('gamesSwiper') gamesSwiper: SwiperComponent;


  // nomeMateria: string;

  /**
   * Per la ricerca dei giochi dato il nome delle materie 
   */
  searchMatterGame: string = '';
  materieMap: { [key: number]: string } = {};
  materieMapPopulated: boolean;


  /**
 * Per la ricerca dei giochi dato il nome della categoria  
 */
  searchCategoryGame: string = '';
  categoryMap: { [key: number]: string } = {};
  categoryMapPopulated: boolean;

  categorieNomi: { [key: number]: string } = {}; // Mappa per memorizzare i nomi delle categorie
  materieNomi = {}; // Mappa per memorizzare i nomi delle materie


  constructor(
    private popoverController: PopoverController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private materiaService: MateriaService,
    private categoriaService: CategoriaService,
    private router: Router,
    private reportisticaService: ReportisticaService,
    private zone: NgZone
  ) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente)
          if (tipoUtente == "ADMIN") this.tipoUtente = tipoUtente;
      }
    )
      .then(_ => {

        this.loadGames(); this.loadMaterie(); this.loadCategorie();   //  carico le materie e categorie da api, con il metodo su materiaService e categoriaService 
      });

  }

  ngAfterContentChecked() {
    if (this.gamesSwiper)
      this.gamesSwiper.updateSwiper({});
  }

  ngOnInit() {

  }

  /**
   * Popola la mappa delle materie con i nomi dato l'id  (usato per ricercare i giochi dato il nome della materia)
   * Quindi vado a prendere tutti i nomi delle materie dato l'id 
   */
  async populateMatterMap() {
    const promises = this.games.map(async (game) => {
      try {
        const materiaName = await this.materiaService.getMateriaNameById(game.id_materia);
        this.materieMap[game.id_materia] = materiaName;
      } catch (error) {
        console.error('Errore durante il recupero del nome della materia:', error);
      }
    });
    await Promise.all(promises);
    this.materieMapPopulated = true;
  }


  /**
   * Popola la mappa delle categorie con i nomi dato l'id (usato per ricercare i giochi dato il nome della categoria)
   * Quindi vado a prendere tutti i nomi delle categorie dato l'id 
   */
  async populateCategoryMap() {
    const promises = this.games.map(async (game) => {
      try {
        const categoryName = await this.categoriaService.getCategoryNameById(game.id_categoria);
        this.categoryMap[game.id_categoria] = categoryName;
      } catch (error) {
        console.error('Errore durante il recupero del nome della categoria:', error);
      }
    });
    await Promise.all(promises);
    this.categoryMapPopulated = true;

  }

  /**
   * Ricerca gioco per materia 
   */
  onSearchMatterGame() {
    if (!this.materieMapPopulated) {
      // Popola la mappa delle materie 
      this.populateMatterMap().then(() => {
        if (this.searchMatterGame.trim() === '') {
          // Se la ricerca è vuota, reimposta this.games a tutti i giochi
          this.loadGames();
        }
        else {
          this.games = this.games.filter((game) => {
            const materiaName = this.materieMap[game.id_materia] || '';
            const includes = materiaName.toLowerCase().includes(this.searchMatterGame.toLowerCase());
            return includes;
          });
        }
      });
    } else {
      // Se la mappa delle materie è già popolata, filtro direttamente i giochi
      if (this.searchMatterGame.trim() === '') {
        this.loadGames();
      } else {
        this.games = this.games.filter((game) => {
          const materiaName = this.materieMap[game.id_materia] || '';
          const includes = materiaName.toLowerCase().includes(this.searchMatterGame.toLowerCase());
          return includes;
        });
      }
    }
  }


  /**
   * Ricerca gioco per materia 
   */
  onSearchCategoryGame() {
    if (!this.categoryMapPopulated) {
      // Popola la mappa delle materie 
      this.populateCategoryMap().then(() => {
        if (this.searchCategoryGame.trim() === '') {
          // Se la ricerca è vuota, reimposta this.games a tutti i giochi
          this.loadGames();
        }
        else {
          this.games = this.games.filter((game) => {
            const categoryName = this.categoryMap[game.id_categoria] || '';
            const includes = categoryName.toLowerCase().includes(this.searchCategoryGame.toLowerCase());
            return includes;
          });
        }
      });
    } else {
      // Se la mappa delle categoria è già popolata, filtro direttamente i giochi
      if (this.searchCategoryGame.trim() === '') {
        this.loadGames();
      } else {
        this.games = this.games.filter((game) => {
          const categoryName = this.materieMap[game.id_categoria] || '';
          const includes = categoryName.toLowerCase().includes(this.searchCategoryGame.toLowerCase());
          return includes;
        });
      }
    }
  }

  async createGame() {
    const modal = await this.modalCtrl.create({
      component: CreateGamePage,
      cssClass: 'fullscreen'
    });

    modal.onDidDismiss().then((data) => {
      const newGameCreated = data['data'];

      if (newGameCreated)
        this.loadGames()
    });

    return await modal.present();
  }

  async openUserPopover(event) {
    const popover = await this.popoverController.create({
      component: UserPopoverComponent,
      event,
      cssClass: 'popover'
    });
    return await popover.present();
  }

  /**
   * Apre il popover per:
   * * creare una lobby,
   * * ricercare le lobby pubbliche,
   * * partecipare ad una lobby privata.
   */
  async openIntroLobby(game) {
    const giocoSelezionato = game;
    const popover = await this.popoverController.create({
      component: IntroLobbyPopoverComponent,
      componentProps: {
        giocoSelezionato: giocoSelezionato
      },
      cssClass: 'popover'
    });

    popover.onDidDismiss().then((data) => {
      const modified = data['data'];

      if (modified) {
        this.loadGames();
        console.log("Modified, games reloaded.");

      }
    });

    return await popover.present();
  }

  /**
   * Carica le Informazioni dei Giochi della Piattaforma.
   */
  async loadGames() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    var url: string;
    if (this.tipoUtente == "ADMIN") url = '/games/admin';
    else url = '/games';

    this.http.get(url, { headers }).subscribe(
      async (res) => {
        this.games = res['results'];
        this.mappaNomiCategorieMaterie();
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Impossibile caricare i giochi!');
      });
  }

  /**
   * Carica le materie da database 
   */
  loadMaterie() {
    this.materiaService.getListaMaterie();  //carico le materie da db e le salvo in materie del materiaService 
  }


  /**
 * Carica le categorie da database 
 */
  loadCategorie() {
    this.categoriaService.getListaCategorie();
  }




  /**Apre la pagina della reportistica */
  openReportistica() {
    this.router.navigateByUrl('/player/dashboard', { replaceUrl: true });
  }




  /**
    * Mappatura dei nomi delle materie e caterie 
    * (nb nel gioco è presente solo idmateria e idcategoria), quindi vado a prendere tutti i nomi 
    */
  async mappaNomiCategorieMaterie() {

    const categoriaMateriaPromises = this.games.map(async (game) => {
      try {
        const nomeCategoria = await this.categoriaService.getCategoryNameById(game.id_categoria);

        this.categorieNomi[game.id_categoria] = nomeCategoria;

        const nomeMateria = await this.materiaService.getMateriaNameById(game.id_materia);

        this.materieNomi[game.id_materia] = nomeMateria;

      } catch (error) {
        console.error(error);
      }
    });

    // aspetta che tutte le promise siano risolte prima di procedere
    await Promise.all(categoriaMateriaPromises);
  }

}

