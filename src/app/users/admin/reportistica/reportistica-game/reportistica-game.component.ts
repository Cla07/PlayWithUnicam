import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ModalController } from '@ionic/angular';
import { AlertCreatorService } from 'src/app/services/alert-creator/alert-creator.service';
import { ErrorManagerService } from 'src/app/services/error-manager/error-manager.service';
import { LoginService } from 'src/app/services/login-service/login.service';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportistica-game',
  templateUrl: './reportistica-game.component.html',
  styleUrls: ['./reportistica-game.component.scss'],
})
export class ReportisticaGameComponent implements OnInit {


  nomeGioco: string
  page = 0;
  resultsCount = 10;
  totalPages = 10;
  // users = [];
  reportGame = []; //reportistica del gioco
  bulkDownload = false; //bulkDownload = false;
  download = {} // edit = {};
  sortDirection = 0;
  sortKey = null;
  maximumPages = 2;

  selectAllChecked: boolean = false;


  constructor(private route: ActivatedRoute,
    private http: HttpClient,
    private modalController: ModalController,
    private loginService: LoginService,
    private errorManager: ErrorManagerService,
    private alertCreator: AlertCreatorService
  ) {
    //this.loadUsers(); 
    //    caricare la reportistica del gioco nomeGioco 
    // this.getReportisticaGame(this.nomeGioco)
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.nomeGioco = params['nomeGioco'];
    });
    this.loadReportistica(this.nomeGioco)  //carica la reportistica dato il nome del gioco
  }


  /**
   * Carica la reportistica di un gioco dato il nome 
   * @param nomeGioco 
   */
  async loadReportistica(nomeGioco) {
    const tokenValue = (await this.loginService.getToken()).value;

    const headers = {
      'token': tokenValue,
      'nome': nomeGioco
    }

    this.http.get('/admin/reportGame', { headers }).subscribe(
      async (res) => {
        this.reportGame = this.reportGame.concat(res['results']);
      },
      async (res) => {
        this.errorManager.stampaErrore(res, 'Errore!');
      });
  }


  downloadRecord(recordId: number): Observable<any> {

    const recordData = { id: recordId, /* ... altre informazioni ... */ };
    const jsonData = JSON.stringify(recordData);

    // Simula una chiamata HTTP ritornando i dati.
    return new Observable(observer => {
      observer.next(jsonData);
      observer.complete();
    });
  }


  downloadSelectedRecord() {
    //const selectedRecordId =   //prendere il record dalla checkbox 
    let toDownload = Object.keys(this.download);
    const indexesToDownload = toDownload.filter(index => this.download[index]).map(key => +key);

    indexesToDownload.forEach(indexDown => {
      this.downloadRecord(indexDown).subscribe(data => {
        this.downloadFileJSON(data, 'record.json', 'application/json');

      })
    });

  }

  /**
   * 
   * @param report Scaricamento di un singolo report, premendo il bottone a lato 
   * @param index 
   */
  //Funziona ma scarica in formato JSON 
  downloadReportSingoloJson(report: any, index: any) {
    //scaricare il record 
    //prendo da reportGame(report in tabella reportistica) il codice partita uguale a quello scelto nel frontend
    const reportToDownload = this.reportGame.filter(reportG => reportG.cod_partita == report.cod_partita)

    const reportJsonData = JSON.stringify(reportToDownload);

    //scarico il file 
    this.downloadFileJSON(reportJsonData, 'record.json', 'application/json');

  }

  /**
   * Scaricamento file in formato xlsx
   * @param report 
   * @param index 
   */
  //funziona in excel 
  downloadReportSingoloExcel(report: any, index: any) {
    // Scaricare il record
    // Prendo da reportGame (report in tabella reportistica) il codice partita uguale a quello scelto nel frontend
    const reportToDownload = this.reportGame.filter(reportG => reportG.cod_partita == report.cod_partita);

    // Estraggo i nomi delle colonne dai dati.
    const columns = Object.keys(reportToDownload[0]); // Usa reportToDownload[0] per ottenere un oggetto rappresentativo di un record

    // Creazione del foglio excel e formattazione dei dati.
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      columns,
      ...reportToDownload.map(reportData => columns.map(col => reportData[col]))
    ]);

    // Impostazione della larghezza delle colonne 
    const wscols: XLSX.ColInfo[] = columns.map(col => ({ wch: col.length * 2 })); // Imposta la larghezza in base alla lunghezza del nome della colonna.
    ws['!cols'] = wscols;

    // Creo il workbook e aggiungo la pagina excel.
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Record');

    // Salva il file Excel come array di byte.
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Converzione dell'array di byte in un oggetto Blob per il download.
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    //scarico il file excel 
    this.downloadFileExcel(blob, 'record.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  }


  /**
   * Scaricamento del file json 
   * @param data 
   * @param filename 
   * @param mimeType 
   */
  private downloadFileJSON(data: any, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    link.setAttribute('download', filename);
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

  }
  //Scaricamento file excel 

  private downloadFileExcel(data: any, filename: string, mimeType: string): void {
    const blob = new Blob([data], { type: mimeType });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    link.setAttribute('download', filename);
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }


  /**
   * Seleziona tutti icheckbox 
   */
  selectAllCheckboxes() {

    //scarico tutti i record 
    this.downloadAllReportsExcel()

  }

  /**
   * Ordina l'Array degli Utenti attraverso una key.
   * @param key Attributo degli Utenti su cui effettuare l'Ordinamento
   */
  sortBy(key) {
    this.sortKey = key;
    this.sortDirection++;
    this.sort();
  }

  /**
   * Ordina l'Array degli Utenti.
   * //TODO finire commento
   */
  sort() {
    if (this.sortDirection == 1) {
      //   this.users = this.users.sort((a, b) => {
      this.reportGame = this.reportGame.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        return valA.localeCompare(valB);
      });
    } else if (this.sortDirection == 2) {
      // this.users = this.users.sort((a, b) => {
      this.reportGame = this.reportGame.sort((a, b) => {
        const valA = a[this.sortKey];
        const valB = b[this.sortKey];
        return valB.localeCompare(valA);
      });
    } else {
      this.sortDirection = 0;
      this.sortKey = null;
    }
  }

  /**
   * Abilita il selezionamento multiplo degli elementi per il download di più reportistiche
   */
  toggleBulkEdit() {
    this.bulkDownload = !this.bulkDownload;
    this.download = {};  // this.edit = {};
  }


  //scarico file selezionati excel 
  downloadMultipleReportExcel() {
    const reportsToDownloadSelected = this.getReportCodPartitaToDownload();

    // Estrai i nomi delle colonne dai dati.
    const columns = Object.keys(reportsToDownloadSelected[0]); // Usa reportToDownload[0] per ottenere un oggetto rappresentativo di un record

    // Crea il foglio di lavoro e formatta i dati.
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      columns,
      ...reportsToDownloadSelected.map(reportData => columns.map(col => reportData[col]))
    ]);

    // Imposta la larghezza delle colonne (opzionale).
    const wscols: XLSX.ColInfo[] = columns.map(col => ({ wch: col.length * 2 })); // Imposta la larghezza in base alla lunghezza del nome della colonna.
    ws['!cols'] = wscols;

    // Crea il libro e aggiungi il foglio di lavoro.
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Record');

    // Salva il file Excel come array di byte.
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Converti l'array di byte in un oggetto Blob per il download.
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    //scaricamento del file 
    this.downloadFileExcel(blob, 'record.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  }


  /**
   * Scarica tutta la reportistica
   */
  downloadAllReportsExcel() {
    // const reportsToDownloadSelected = this.getReportCodPartitaToDownload();


    // Estrai i nomi delle colonne dai dati.
    const columns = Object.keys(this.reportGame[0]); // Usa reportToDownload[0] per ottenere un oggetto rappresentativo di un record

    // Crea il foglio di lavoro e formatta i dati.
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([
      columns,
      ...this.reportGame.map(reportData => columns.map(col => reportData[col]))
    ]);

    // Imposta la larghezza delle colonne (opzionale).
    const wscols: XLSX.ColInfo[] = columns.map(col => ({ wch: col.length * 2 })); // Imposta la larghezza in base alla lunghezza del nome della colonna.
    ws['!cols'] = wscols;

    // Crea il libro e aggiungi il foglio di lavoro.
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Record');

    // Salva il file Excel come array di byte.
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Converti l'array di byte in un oggetto Blob per il download.
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    //scaricamento del file 
    this.downloadFileExcel(blob, 'record.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  }


  downloadMultipleReportJson() {
    const reportsToDownloadSelected = this.getReportCodPartitaToDownload();
    //   reportsToDownloadSelected.forEach(element => {
    // const reportToDownload = this.reportGame.filter(reportG => reportG.cod_partita == report.cod_partita )

    const reportJsonData = JSON.stringify(reportsToDownloadSelected);

    //scarico il file  JSON 
    this.downloadFileExcel(reportJsonData, 'record.json', 'application/json');

  }


  getReportCodPartitaToDownload() {
    let toDownload = Object.keys(this.download);
    const indexesToDownload = toDownload.filter(index => this.download[index]).map(key => +key);
    const reportsToDownloads = [];

    while (indexesToDownload.length) {
      reportsToDownloads.push(this.reportGame[indexesToDownload.pop()])
    }

    return reportsToDownloads;

  }


  /**
 * Controlla se ci sono report selezionati tramite le checkbox.
 * 
 * @returns true se almeno un elemento è selezionato, false altrimenti
 */

  checkSelectedReports() {
    var selected = false;
    let keys = Object.keys(this.download);
    while (keys.length) {
      if (this.download[keys.pop()]) selected = true;
    }
    return selected;
  }

  /**
   * Mostra un alert per chiedere conferma dello scaricamento e in caso positivo scarica la/le reportistica/che selezionate 
   */
  async bulkDownloads() {

    if (this.download && Object.keys(this.download).length != 0 && this.download.constructor === Object && this.checkSelectedReports()) {
      var messaggio = "Confermi di voler scaricaricare gli elementi selezionati?";

      this.alertCreator.createConfirmationAlert(messaggio, () => { this.downloadMultipleReportExcel(); });
    } else {
      var messaggio = 'Seleziona prima qualche elemento!';

      this.alertCreator.createInfoAlert('Errore', messaggio);
    }
  }
}