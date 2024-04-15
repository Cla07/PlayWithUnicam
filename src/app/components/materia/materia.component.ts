import { Component, OnInit } from '@angular/core';
import { MateriaService } from 'src/app/users/admin/services/materia-service/materia.service';
import { Materia } from '../materia';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { element } from 'protractor';

@Component({
  selector: 'app-materia',
  templateUrl: './materia.component.html',
  styleUrls: ['./materia.component.scss'],
})
export class MateriaComponent implements OnInit {

  materie: Materia[] = [];   //salvo le materie da API (materiaService)
  materiaForm: FormGroup;
  isAltraMateria: boolean = false;
  pageTitle: string = "MATERIE"

  materiaScelta: Materia;  
  
  materiaInserita: string;

  idMateriaInserita: number;

  modalType: string;

  constructor(private materiaService: MateriaService, private fb: FormBuilder,private modalController: ModalController, private alertCreator: AlertCreatorService) {
     
   }

  ngOnInit() {
    
      this.materiaForm  = this.fb.group({
        materiaSel: ['', Validators.required],
        materiaIns: ['', Validators.required],
    });
    
 this.getMaterie()  //prendo le materie dal service 

 this.modalType = this.materiaService.getModalType();
  }


  eliminaMateria(){
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare la materia dal database ?", async () => {
     this.materiaService.eliminaMateria(this.materiaScelta.nome);
    });
   
   console.log("Elimino la materia "+this.materiaScelta.nome)
  }


  getMaterie(){
    this.materie = this.materiaService.getMaterie();
  }

 

  getMateriaScelta(){
    return this.materiaScelta;
  }

  getIdMateriaScelta(){
    return this.materiaScelta.id;
  }


  saveMateria(){

   

//1) se è stata scelta una materia e diversa da altra, prendo l'id della materia e la aggiungo al gioco, quindi 
//trasferire l'id della materia nel componente padre Create Game 

if (!this.isAltraMateria && this.materie ) {
  console.log("Materia scelta al Submit nome e id: "+this.materiaScelta.nome +'-' + this.materiaScelta.id);  //ok 
  console.log("Materia scelta al Submit: "+this.materiaScelta);   //stampa object
  this.materiaService.setIdMateriaFromSelect(this.materiaScelta.id);  //prendo l'id della materia scelto lo setto nel service, poi vado a riprendere tale valore nel service e lo metto nel gioco da creare 

  this.materiaService.setNomeMateria(this.materiaScelta.nome);
}

//ad esempio se qui l'utente mette matematica che ha id 1, prendo questo 1 lo salvo nella variabile del service e poi lo riprendo 
//dal service e lo metto qui 
 
//2) altrimenti prendo la materia inserita (dall'utente) e la inserisco alla tabella Materia 

if (this.isAltraMateria) {
  this.materiaInserita = this.materiaForm.value.materiaIns  //salvo il valore dela materia inserita nelll'input 

  this.materiaService.creaMateria(this.materiaInserita);  //inserisco la nuova materia nel db 

  this.materiaService.setNomeMateria(this.materiaInserita);

}
this.materiaForm.reset();  //svuoto il form

 this.modalController.dismiss(); //Chiudo la modale 

  }

 
//Salvo la materia scelta dall'utente alla select
  selectMateria(materia: Materia){
    this.materiaScelta = materia;
    console.log("Materia scelta: "+this.materiaScelta.nome +'-'+this.materiaScelta.id)

  }

  selectAltraMateria(){
    this.isAltraMateria = true;
   // this.isSelectedMateria = true;
  }

 

  closeModal(){
    this.modalController.dismiss();
  }

}
