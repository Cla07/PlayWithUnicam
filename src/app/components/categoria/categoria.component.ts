import { Component, OnInit } from '@angular/core';
import { CategoriaService } from 'src/app/users/admin/services/categoria-service/categoria.service';
import { Categoria } from '../categoria';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { element } from 'protractor';
@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss'],
})
export class CategoriaComponent implements OnInit {

  categorie: Categoria[] = [];   //salvo le categorie da API (categoriaService)
  categoriaForm: FormGroup;
  isAltraCategoria: boolean = false;
  pageTitle: string = "CATEGORIE"

  categoriaScelta: Categoria;  
  
  categoriaInserita: string;

  idCategoriaInserita: number;

  modalType: string;

  constructor(private categoriaService: CategoriaService, private fb: FormBuilder,private modalController: ModalController, private alertCreator: AlertCreatorService) {
     
   }

  ngOnInit() {
    
      this.categoriaForm  = this.fb.group({
        categoriaSel: ['', Validators.required],
        categoriaIns: ['', Validators.required],
    });
    
 this.getCategorie()  //prendo le categorie dal service 

 this.modalType = this.categoriaService.getModalType();
  }


  eliminaCategoria(){
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare la categoria dal database ?", async () => {
     this.categoriaService.eliminaCategoria(this.categoriaScelta.nome);
    });
   
   console.log("Elimino la categoria "+this.categoriaScelta.nome)
  }


  getCategorie(){
    this.categorie = this.categoriaService.getCategorie();
  }

 

  getCategoriaScelta(){
    return this.categoriaScelta;
  }

  getIdCategoriaScelta(){
    return this.categoriaScelta.id;
  }


  saveCategoria(){

   

//1) se è stata scelta una categoria e diversa da altra, prendo l'id della categoria e la aggiungo al gioco, quindi 
//trasferire l'id della categoria nel componente padre Create Game 

if (!this.isAltraCategoria && this.categorie ) {

  this.categoriaService.setIdCategoriaFromSelect(this.categoriaScelta.id);  //prendo l'id della categoria scelto lo setto nel service, poi vado a riprendere tale valore nel service e lo metto nel gioco da creare 

  this.categoriaService.setNomeCategoria(this.categoriaScelta.nome);
}

//ad esempio se qui l'utente mette matematica che ha id 1, prendo questo 1 lo salvo nella variabile del service e poi lo riprendo 
//dal service e lo metto qui 
 
//2) altrimenti prendo la categoria inserita (dall'utente) e la inserisco alla tabella Categoria 

if (this.isAltraCategoria) {
  this.categoriaInserita = this.categoriaForm.value.categoriaIns  //salvo il valore dela categoria inserita nelll'input 

  this.categoriaService.creaCategoria(this.categoriaInserita);  //inserisco la nuova categoria nel db 

  this.categoriaService.setNomeCategoria(this.categoriaInserita);

}
this.categoriaForm.reset();  //svuoto il form

 this.modalController.dismiss(); //Chiudo la modale 

  }

 
//Salvo la categoria scelta dall'utente alla select
  selectCategoria(categoria: Categoria){
    this.categoriaScelta = categoria;
    console.log("Categoria scelta: "+this.categoriaScelta.nome +'-'+this.categoriaScelta.id)

  }

  selectAltraCategoria(){
    this.isAltraCategoria = true;
  }

  closeModal(){
    this.modalController.dismiss();
  }

}
