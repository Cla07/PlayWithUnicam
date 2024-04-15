import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Skill } from 'src/app/components/skill';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';


import skillsGameQuiz from 'src/app/PlayWithUnicam-Games/quiz/skills/skill.json'
import skillsGooseGame from 'src/app/PlayWithUnicam-Games/goose-game/skills/skill.json'
import skillsMemoryGame from 'src/app/PlayWithUnicam-Games/memory-game/skills/skill.json'
import skillsPixelartGame from 'src/app/PlayWithUnicam-Games/pixelart/skills/skill.json'
import skillsPercorsiGame from 'src/app/PlayWithUnicam-Games/percorsi/skills/skill.json'


@Injectable({
  providedIn: 'root'
})
export class SkillService {

  skillsJson: Skill[] = [];  //skill da inserire nel db presi dal json di ogni gioco 

  skillsOnDb: Skill[] = []; //skills già presenti nel db 

  newSkills: Skill[] = [];  //nuove skills da inserire nel database 

  private pathSkillsGame: string //percorso delle skill del gioco selezionato alla creazione 

  urlSelectedGame: string;

  idGame: any;  //id del gioco da inserire, serve per la relazione giochi skill 

  idSkill: any; //id della skill 

  listIdSkill: any[] = [];  //lista id skill  

  listNomiSkillJson: string[] = [];

  /**
   * Lista dei skill di un certo gioco di un certo idGame 
   * presi da db, da giochi_skill ecc
   */
  skillsFromIdGame: Skill[] = [];

  /**
   * Lista dei skill di un certo gioco al termine di una partita 
   * (sono i skill salvati in utente_skill)
   */
  private skillsUserMatch: Skill[] = [];

  constructor(private http: HttpClient, private loginService: LoginService, private errorManager: ErrorManagerService, private loadingController: LoadingController) { }

  //Inserimento di una skill nel db
  async createSkill(skill: Skill) {
    //  const loading = await this.loadingController.create();
    //  await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}

    toSend.nome = skill.nome
    toSend.tipo = skill.tipo
    toSend.descrizione = skill.descrizione
    toSend.token = tokenValue;

    this.http.post('/skill/crea', toSend).subscribe(
      async (res) => {

        this.idSkill = await res['results'][0].id; //viene restituito l'id della skill inserita e la salvo 

        this.listIdSkill.push(await this.idSkill);   //aggiunge alla lista tutti gli id delle skill di questo gioco (serve per metterli nella tabella giochi_skill)
        //    await loading.dismiss();
      },
      async (res) => {
        //     await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Creazione skill fallita');
      });
  }


  //cerco id di una skill dato il suo nome 
  async searchIdSkillFromName(nome): Promise<number> {
    try {
      const tokenValue = (await this.loginService.getToken()).value;
      const headers = { 'token': tokenValue };

      const res = await this.http.get('/skill/' + nome, { headers }).toPromise();
      const idSkill: number = res['results'][0].id;  //salvo id della skill 

      return idSkill;

    } catch (error) {
      this.errorManager.stampaErrore(error, 'Impossibile cercare id della skill dato il nome !');
      throw error;
    }
  }

  /***
   * Assegnazione all'array skills, i skill del json del gioco scelto alla creazione del nuovo gioco
   * questo metodo viene eseguito alla creazione di un nuovo gioco 
   */
  readSkillsGame(urlGame: string) {
    this.urlSelectedGame = urlGame       //salvo l'url del gioco selezionato, serve per l'import del json skill corretto 

    switch (this.urlSelectedGame) {
      case '/goose-game':
        this.skillsJson = skillsGooseGame  //json del gioco (vedere import)
        break;
      case '/memory-game':
        this.skillsJson = skillsMemoryGame
        break;
      case '/quiz':
        this.skillsJson = skillsGameQuiz; //metto nell'array dei skill i skill del gioco QUIZ  

        break;
      case '/pixelart':
        this.skillsJson = skillsPixelartGame
        break;
      case '/percorsi':
        this.skillsJson = skillsPercorsiGame
        break;

      //NB: 
      //Per gli sviluppatori:
      //Se vengono creati nuovi giochi da aggiungere alla piattaforma, aggiungere gli opportuni case, con i vari import in base al gioco creato       
    }


  }

  /**
   * Inserisce tutti i skill di un gioco, letti precedentemente dal json, dopo aver controllato che già non presenti nel db 
   */

  insertSkills() {

    //controllo che i skill presenti nel db, non contengono il skill da inserire (letti dal json)
    this.controlloSePresenteSkillOnDb();

    //inserisco le nuove skill nel db (vengono inseriti solo quelle che già non sono presenti)

    this.newSkills.forEach(skill => {

      this.createSkill(skill);  //inserimento skill nel db 
    });

    //inserimento idgioco e id skill nella tabella giochi_skill per la relazione 

  }

  //controllo i nomi dei skill nel Json che NON sono presenti nel database e li aggiungo ai nuovi skill da inserire nel db 
  controlloSePresenteSkillOnDb() {


    // Creazione della lista dei nomi dei skill presenti nel database
    const listNomiSkillOnDb = this.skillsOnDb.map(skill => skill.nome);

    // Trova le nuove skill non presenti nel database
    this.newSkills = this.skillsJson.filter(skill => !listNomiSkillOnDb.includes(skill.nome));

  }

  /**
   * Prendo id del gioco selezionato per metterlo nella tabella giochi_skill 
   * idGame è id del gioco creato nel createGame 
   */
  async saveIdGameSkill(idGame) {
    this.idGame = idGame;
    console.log("ID GAME skill: " + idGame)

    this.listNomiSkillJson = this.skillsJson.map(skill => skill.nome);   //lista di tutti i nomi dei skill dal json del gioco 


    // Ottengo gli ID dele skill
    const promises = this.listNomiSkillJson.map(async nome => {
      return await this.searchIdSkillFromName(nome);
    });

    try {
      // Attendo il completamento di tutte le chiamate asincrone
      const listIdSkillOnDbFromName = await Promise.all(promises);

      // Inserimento nella tabella giochi_skill id del gioco e id della skill di quel gioco
      listIdSkillOnDbFromName.forEach(idSkill => this.insertIDGameSkill(this.idGame, idSkill));

    } catch (error) {
      console.error('Errore durante il recupero degli ID delle skill:', error);
    }

  }


  //prendo tutte le skill nella tabella skill
  async getSkillsFromDb() {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/skills', { headers })
      .subscribe(
        async (res) => {

          this.skillsOnDb = await res['results'];

        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare le skills dal database!');
        })
  }


  //prendo tuttE le skill di un certo gioco
  //quindi dato l'id del gioco prendo le skill di quel gioco, viene interrogata la tabella giochi_skill, skill e giochi 
  async getSkillsFromIdGame(idGioco: any) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/skills/' + idGioco, { headers })
      .subscribe(
        async (res) => {

          this.skillsFromIdGame = await res['results'];

        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare i skills dal database!');
        })
  }


  getPathBadgesGame() {
    return this.pathSkillsGame;
  }

  getlistaBadgeFromIdGame() {
    return this.skillsFromIdGame;
  }



  //inserisce id del gioco e id del skill nella tabella giochi_skill per la relazione 
  async insertIDGameSkill(id_gioco, id_skill) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}

    toSend.id_gioco = id_gioco;
    toSend.id_skill = id_skill;

    toSend.token = tokenValue;

    this.http.post('/giochi_skill/insert', toSend).subscribe(
      async (res) => {

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella game_skill fallito');
      });
  }

  /**
 * Inserimento nella tabella user_skill, l'username dell'utente e la skill conquistata  
 * e Aggiornamento della tabella reportistica con la skill conquistata 
 * @param username dell'utente
 * @param id_skill conquistata 
 * @param codice_partita codice della partita (dove è stato ottenuto la skill)
 */
  //funzionante perfettamemnte
  async insertUserSkillUpdateReport(username, id_skill, codice_partita) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;

    var toSend: any = {}
    toSend.username = username;
    toSend.id_skill = id_skill;
    toSend.codice_partita = codice_partita;
    toSend.token = tokenValue;
    console.log("insertUserSkillUpdateReport")

    this.http.post('/utente_skill/insert', toSend).subscribe(
      async (res) => {

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella utente_skill e reportistica fallito');
      });
  }


  async insertUserSkillUpdateReport2(username, nome_skill, codice_partita) {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.loginService.getToken()).value;
    console.log("Inserimento in utente skill e aggiornamento reportistica")
    console.log("insertUserSkillUpdateReport2")
    var toSend: any = {}
    toSend.username = username;
    toSend.nome_skill = nome_skill;
    toSend.codice_partita = codice_partita;
    toSend.token = tokenValue;

    this.http.post('/utente_skill/insert2', toSend).subscribe(
      async (res) => {

        await loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Inserimento in tabella utente_skill e reportistica fallito');
      });
  }


  /**
   * Restituisce la  lista delle skill conquistate da un giocatore 
   * @returns lista delle skill conquistate da un giocatore (al momento non utiulizzato questo metodo ) 
   */
  getBadgeUserMatch() {

    return this.skillsUserMatch;
  }


  getlistaSkillFromIdGame() {
    return this.skillsFromIdGame;
  }

}
