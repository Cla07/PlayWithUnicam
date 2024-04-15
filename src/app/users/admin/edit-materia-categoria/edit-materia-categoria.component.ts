import { Component, OnInit } from '@angular/core';
import { Materia } from 'src/app/components/materia';
import { MateriaService } from '../services/materia-service/materia.service';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { Router, RouterLink } from '@angular/router';
import { CategoriaService } from '../services/categoria-service/categoria.service';
import { Categoria } from 'src/app/components/categoria';

@Component({
  selector: 'app-edit-materia-categoria',
  templateUrl: './edit-materia-categoria.component.html',
  styleUrls: ['./edit-materia-categoria.component.scss'],
})
export class EditMateriaCategoriaComponent implements OnInit {

  pageTitle: string = 'GESTIONE MATERIE E CATEGORIE';
  materie: Materia[] = [];   //salvo le materie da API (materiaService)
  materiaScelta: Materia;
  modalType: string;
  redirectPath: string;
  materiaSel: string;


  categorie: Categoria[] = [];
  categoriaScelta: Categoria;
  categoriaSel: string;

  constructor(private materiaService: MateriaService, private categoriaService: CategoriaService, private alertCreator: AlertCreatorService, private router: Router) { }

  ngOnInit() {
    this.getMaterie();  //prendo le materie dal service 
    this.getCategorie();

  }

  eliminaMateria() {
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare la materia dal database ?", async () => {
      this.materiaService.eliminaMateria(this.materiaScelta.nome);
      this.router.navigateByUrl('/admin', { replaceUrl: true });

    });

  }

  getMaterie() {
    this.materie = this.materiaService.getMaterie();
  }


  getMateriaScelta() {
    return this.materiaScelta;
  }
  //Salvo la materia scelta dall'utente alla select
  selectMateria(materia: Materia) {
    this.materiaScelta = materia;
    console.log("Materia scelta: " + this.materiaScelta.nome + '-' + this.materiaScelta.id)

  }


  eliminaCategoria() {
    this.alertCreator.createConfirmationAlert("Sei sicuro di voler eliminare la categoria dal database ?", async () => {
      this.categoriaService.eliminaCategoria(this.categoriaScelta.nome);
      this.router.navigateByUrl('/admin', { replaceUrl: true });
    });

  }

  getCategorie() {
    this.categorie = this.categoriaService.getCategorie();
  }


  getCategoriaScelta() {
    return this.categoriaScelta;
  }
  //Salvo la materia scelta dall'utente alla select
  selectCategoria(categoria: Categoria) {
    this.categoriaScelta = categoria;
  }

  redirectHome() {
    this.router.navigateByUrl('/admin', { replaceUrl: true });
  }

}
