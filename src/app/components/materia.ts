

export class Materia {

     id: number;

     nome: string;

    /**
     * 
     * @param id della materia 
     * @param nome della materia 
     */
    constructor(id: number, nome: string) {
        this.id = id;
        this.nome = nome;
    }

    public getId() : number{
       return this.id;
    }


    public getName(): string {
        return this.nome
    }

}   