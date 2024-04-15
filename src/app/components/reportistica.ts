import { Badge } from "./badge";
import { Skill } from "./skill";


/**
 * Contiene i dati di una partita di un giocatore 
 */
export class Reportistica {

    private id: number; 

    private cod_partita: string;  // è di tipo stringa perchè altrimenti non si poteva usare come chiave esterna con il codice di partita

    private id_gioco: number;

    private username: string; //username del giocatore 
    
    private score: number;

    private answers: number; //numero  delle risposte totali

    private time: number;

    private badges: Badge[];

    private skills: Skill[];

    /**
     * @param id della reportistica
     * @param username del giocatore 
     * @param cod_partita codice della partita 
     * @param id_gioco id del gioco 
     * @param score punteggio della partita (che corrisponde alle domande che si è risposto correttamente)
     * @param answers numero delle risposte totali 
     * @param time tempo impiegato a svolgere la partita 
     * @param badges lista badges ottenuti 
     * @param skills lista skills ottenute  
     */    // badges?: any, skills?: Skill[], 
    constructor(id:number, username: string, cod_partita: string, id_gioco:number,  score: number,  answers: number, time: number, badges?: any, skills?: any) {
        this.id = id;
        this.username = username;
        this.cod_partita = cod_partita;
        this.id_gioco = id_gioco;
        this.score = score;
        this.answers = answers
        this.time = time;
        if (badges) {
            this.badges = badges;
        }
        if (skills) {
            this.skills = skills;
        }
    }


    public getUsername(): string {
        return this.username;
    }
    public setUsername(value: string) {
        this.username = value;
    }

    public getCodPartita(): string {
        return this.cod_partita;
    }
    public setCodPartita(value: string) {
        this.cod_partita = value;
    }

    public getScore(): number {
        return this.score;
    }
    public setScore(value: number) {
        this.score = value;
    }


    public getTime(): any {
        return this.time;
    }
    public setTime(value: any) {
        this.time = value;
    }

    public getAnswers(): number {
        return this.answers;
    }
    public setAnswers(value: number) {
        this.answers = value;
    }

    public getBadges(): Badge[] {
        return this.badges;
    }
    public setBadges(value: Badge[]) {
        this.badges = value;
    }

    public getSkills(): Skill[] {
        return this.skills;
    }
    public setSkills(value: Skill[]) {
        this.skills = value;
    }
}