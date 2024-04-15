export class Categoria {
     id: number;

    nome: string;

    /**
     * 
     * @param id della categoria 
     * @param nome della categoria 
     */
    constructor(id: number, nome: string) {
        this.id = id;
        this.nome = nome;
    }


    public getId() {
        this.id
    }


    public getNome() {
        this.nome
    }
}