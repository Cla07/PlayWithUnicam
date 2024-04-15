import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';
import { UserPopoverComponent } from 'src/app/components/user-popover/user-popover.component';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { SwiperComponent } from 'swiper/angular';
import { IntroLobbyPopoverComponent } from '../../player/popover/intro-lobby-popover/intro-lobby-popover.component';
import { CategoriaService } from '../services/categoria-service/categoria.service';
import { MateriaService } from '../services/materia-service/materia.service';

@Component({
  selector: 'app-reportistica',
  templateUrl: './reportistica.component.html',
  styleUrls: ['./reportistica.component.scss'],
})
export class ReportisticaComponent implements OnInit {

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

  subscriptionNumeroPartite: any;
  numeroPartiteGioc: number;

  categorieNomi = {}; // Mappa per memorizzare i nomi delle categorie
  materieNomi = {}; // Mappa per memorizzare i nomi delle materie


  constructor(
    private popoverController: PopoverController,
    private modalCtrl: ModalController,
    private http: HttpClient,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private router: Router,
    private route: ActivatedRoute,
    private categoriaService: CategoriaService,
    private materiaService: MateriaService
  ) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente)
          if (tipoUtente == "ADMIN") this.tipoUtente = tipoUtente;
      }
    ).then(_ => {
      this.loadGames();   //carico i giochi 

    });
  }


  ngAfterContentChecked() {
    if (this.gamesSwiper)
      this.gamesSwiper.updateSwiper({});
  }

  ngOnInit() {

  }


  ngOnChanges() {

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
  * Mappatura dei nomi delle materie e caterie 
  * (nb nel gioco è presente solo idmateria e idcategoria), quindi vado a prendere tutti i nomi 
  */


  async mappaNomiCategorieMaterie() {

    this.games.map(async (game) => {
      try {
        const nomeCategoria = await this.categoriaService.getCategoryNameById(game.id_categoria);

        this.categorieNomi[game.id_categoria] = nomeCategoria;

        const nomeMateria = await this.materiaService.getMateriaNameById(game.id_materia);

        this.materieNomi[game.id_materia] = nomeMateria;

      } catch (error) {
        console.error(error);
      }
    });
  }

  /**
   * 
   * @param game Apre la pagina della reportistica del gioco selezionato 
   */


  openReportisticaGame(game) {
    const giocoSelezionato = game;
    this.router.navigate(['reportistica', giocoSelezionato.nome]);
    // this.router.navigate(['/game', giocoSelezionato.nome]);
  }



} //fine classe 