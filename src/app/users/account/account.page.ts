import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { LoginService } from 'src/app/services/login-service/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { HttpClient } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  tipoUtente: string;
  dati: FormGroup;
  passwords: FormGroup;
  user = { 'username': null, 'nome': null, 'cognome': null, 'password': null, 'salt': null, 'tipo': null };

  
  badgesFromUsername: any [];
  skillsFromUsername: any [] ;

  constructor(
    private loadingController: LoadingController,
    private logService: LoginService,
    private errorManager: ErrorManagerService,
    private http: HttpClient,
    private fb: FormBuilder,
    private alertCreator: AlertCreatorService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.loginService.getUserType().then(
      tipoUtente => {
        if (tipoUtente)
          if (tipoUtente == "ADMIN") this.tipoUtente = tipoUtente;
      }
    ).then(_ => { this.getDatiProfilo();  
    
    });   
  }

  ngOnInit() {
    this.passwords = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
      passwordConfirmed: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(16)],],
    });
    this.riempiForm();
  }

  /**
   * Riempe il Form per la modifica dei Dati dell'Account con i dati presi dal Server.
   */
  riempiForm() {
    this.dati = this.fb.group({
      username: [this.user.username, [Validators.required]],
      nome: [this.user.nome, [Validators.required]],
      cognome: [this.user.cognome, [Validators.required]]
    })

    this.getBadgesFromUser(this.user.username);   //prendo badge conquistati dal giocatore corrente 
    this.getSkillsFromUser(this.user.username);   //prendo skill conquistate dal giocatore corrente 

  }

  /**
   * Richiede i dati dell'Account dal Server.
   */
  async getDatiProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();
    const tokenValue = (await this.logService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/info/utente', { headers }).subscribe(
      async (res) => {
        this.user = await res['results'][0];
        this.riempiForm();
        await loading.dismiss();
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Errore');
        await loading.dismiss();
      });
  }

  /**
   * Salva i nuovi dati dell'Account *(nome, cognome)* sul Server.
   */
  async aggiornaProfilo() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.logService.getToken()).value;
    var toSend = {
      'nome': this.dati.value.nome,
      'cognome': this.dati.value.cognome,
      'token': tokenValue,
    }

    this.http.put('/player/profilo', toSend).subscribe(
      async (res) => {
        await this.aggiornaUsername(tokenValue);
        loading.dismiss();
      },
      async (res) => {
        await loading.dismiss();
        this.errorManager.stampaErrore(res, 'Modifica fallita');
      });
  }

  /**
   * Salva il nuovo Username dell'Account sul Server.
   * @param token JWT dell'Account 
   */
  async aggiornaUsername(token) {
    if (this.user.username === this.dati.value.username) {
      this.alertCreator.createInfoAlert("Profilo aggiornato", "Il profilo è stato aggiornato");
    } else {
      var toSend = {
        'new_username': this.dati.value.username,
        'token': token,
      }

      this.http.put('/player/username', toSend).pipe(
        map((data: any) => data.accessToken),
        switchMap(token => {
          this.logService.setToken(token);
          return '1';
        })).subscribe(
          async (res) => {
            this.alertCreator.createInfoAlert("Profilo aggiornato", "Il profilo è stato aggiornato");
            this.getDatiProfilo();
          },
          async (res) => {
            this.dati.value.username = this.user.username;
            this.errorManager.stampaErrore(res, 'Modifica fallita');
          });
    }
  }

  /**
   * Salva la nuova Password dell'Account sul Server.
   */
  async aggiornaPassword() {
    const loading = await this.loadingController.create();
    await loading.present();

    const tokenValue = (await this.logService.getToken()).value;

    const toSend = {
      'old_password': this.passwords.value.oldPassword,
      'new_password': this.passwords.value.newPassword,
      'token': tokenValue
    }

    if (this.passwords.value.newPassword == this.passwords.value.passwordConfirmed) {
      this.http.put('/modifica/password', toSend).subscribe(
        async (res) => {
          this.passwords.reset();
          await loading.dismiss();
          this.alertCreator.createInfoAlert("Password aggiornata", "La password è stata aggiornata");
        },
        async (res) => {
          await loading.dismiss();
          this.errorManager.stampaErrore(res, 'Modifica fallita');
        });
    }
    else {
      this.alertCreator.createInfoAlert("Le password non corrispondono", "La password di conferma non corrisponde alla nuova password");
      await loading.dismiss();
    }
  }


  /**
 * Restituisce tutti i badge conquistati da un giocatore 
 * @param 
 */
  async getBadgesFromUser(username: any) {
    const tokenValue = (await this.loginService.getToken()).value;
    const headers = { 'token': tokenValue };

    this.http.get('/badge/username/'+username, { headers })
      .subscribe(
        async (res) => {
  
          this.badgesFromUsername  = await res['results']; 
       
        // Ordinamento per numero nel badge e tipo
          this.sortingBadgesForNumberType();
        },
        async (res) => {
          this.errorManager.stampaErrore(res, 'Impossibile caricare i badges di un certo giocatore da database!');
        })
  }

    /**
 * Restituisce tutti i badge conquistati da un giocatore 
 * @param 
 */
    async getSkillsFromUser(username: any) {
      const tokenValue = (await this.loginService.getToken()).value;
      const headers = { 'token': tokenValue };
  
      this.http.get('/skill/username/'+username, { headers })
        .subscribe(
          async (res) => {
    
            this.skillsFromUsername  = await res['results']; 
  
          },
          async (res) => {
            this.errorManager.stampaErrore(res, 'Impossibile caricare le skills di un certo giocatore da database!');
          })
    }

/**
 * Ordina badges conquistati per nome e tipo 
 * 
 */
   public sortingBadgesForNumberType(){

     // Ordinamento badge per numero (crescente) e poi per tipo
     this.badgesFromUsername.sort((a, b) => {
      const aCount = parseInt(a.nome.match(/\d+/)[0], 10);
      const bCount = parseInt(b.nome.match(/\d+/)[0], 10);

      if (aCount !== bCount) {
        return aCount - bCount; // Ordinamento per numero
      } else {
        return a.tipo.localeCompare(b.tipo); // Ordinamento per tipo
      }
    });

   }

}