const db = require('../database');
const lobby = require('./lobby');
const controller = require('../controller');
const messaggi = require('../messaggi');

/**
 * Crea un nuovo Gioco.
 * @param {string} nome Nome del Gioco
 * @param {string} tipo Tipologia del Gioco (es. "Gioco a TURNI")
 * @param {*} minGiocatori Numero Minimo di Giocatori
 * @param {*} maxGiocatori Numero Massimo di Giocatori
 * @param {string} link Link del Gioco
 * @param {boolean} attivo Valore booleano per determinare se il Gioco è attivo o no
 * @param {JSON} config JSON di Configuarazione del Gioco
 * @param {string} regolamento Regolamento del Gioco
 */
exports.creaGioco = (nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento, id_materia, id_categoria) => {   
    nome = controller.xssSanitize(nome);
    tipo = controller.xssSanitize(tipo);
    link = controller.xssSanitize(link);
    regolamento = controller.xssSanitize(regolamento);

    return new Promise((resolve, reject) => {
        controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento)  //conrollare materia e categoria 
            .then(_ => {
                db.pool.query('INSERT INTO public.giochi (nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento, id_materia, id_categoria) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', 
                    [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento, id_materia, id_categoria], (error, results) => {  
                        if (error) {
                            console.log(error);
                            return reject(new Error(messaggi.CREAZIONE_GIOCO_ERROR));
                        }
                        return resolve();
                    })
            })
            .catch(error => { return reject(error); });
    })
}

//TODO commentare
exports.deleteGame = (id) => {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.giochi WHERE id = $1',
            [id], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(new Error("Errore nell'eliminazione del gioco: " + id));
                } else resolve();
            });
    })
}

/**
 * Ritorna il JSON di Configurazione del Gioco.
 * @param {string} username Username del Giocatore che richiede la Configurazione
 */
exports.getConfigGioco = (username) => {
    return new Promise((resolve, reject) => {
        lobby.cercaLobbyByUsername(username)
            .then(results => {
                if (controller.controllaRisultatoQuery(results))
                    throw new Error(messaggi.PARTECIPAZIONE_LOBBY_ERROR);

                db.pool.query('select config from public.giochi where id=$1', [results.rows[0].id_gioco], (error, results) => {
                    if (error)
                        return reject(error);
                    else
                        return resolve(results);
                });
            })
            .catch(error => { return reject(error); });
    })
}

/**
 * Ritorna le Informazioni del Gioco.
 * @param {*} idGioco ID del Gioco
 * @returns Le Informazioni del Gioco (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getInfoGioco = (idGioco) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link from public.giochi where id=$1',
            [idGioco], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Ritorna le Informazioni dei Giochi che sono *"attivi"*.
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link)
 */
exports.getListaGiochi = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, id_materia, id_categoria, link from public.giochi where attivo=$1',
            [true], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Ritorna all'Admim della Piattaforma le Informazioni dei Giochi.
 * @returns Le Informazioni dei Giochi (id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento)
 */
exports.getListaGiochiAsAdmin = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome, tipo, max_giocatori, min_giocatori, link, attivo, config, regolamento, id_materia, id_categoria from public.giochi',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}




/**
 * Modifica le Informazioni del Gioco.
 * @param {*} id ID del Gioco da modificare
 * @param {string} nome Nome del Gioco
 * @param {string} tipo Tipologia del Gioco (es. "Gioco a TURNI")
 * @param {*} minGiocatori Numero Minimo di Giocatori
 * @param {*} maxGiocatori Numero Massimo di Giocatori
 * @param {string} link Link del Gioco
 * @param {boolean} attivo Valore booleano per determinare se il Gioco è attivo o no
 * @param {JSON} config JSON di Configuarazione del Gioco
 * @param {string} regolamento Regolamento del Gioco
 * @param {*} id_materia id materia del gioco 
 * @param {*} id_categoria id categoria del gioco 
 */
exports.modificaGioco = (id, nome, tipo, minGiocatori, maxGiocatori, link, attivo, config, regolamento, id_materia, id_categoria) => {  //, id_materia, id_categoria
    nome = controller.xssSanitize(nome);
    tipo = controller.xssSanitize(tipo);
    link = controller.xssSanitize(link);
    regolamento = controller.xssSanitize(regolamento);
    return new Promise((resolve, reject) => {
        controller.controllaDatiGioco(nome, tipo, minGiocatori, maxGiocatori, link, attivo, regolamento)  
            .then(_ => {
                db.pool.query('UPDATE public.giochi SET nome=$1, tipo=$2, max_giocatori=$3, min_giocatori=$4, link=$5, attivo=$6, config=$7, regolamento=$8, id_materia=$9, id_categoria=$10 WHERE id=$11', 
                    [nome, tipo, maxGiocatori, minGiocatori, link, attivo, config, regolamento, id_materia, id_categoria, id], (error, results) => {  //id_materia, id_categoria,
                        if (error) {
                            console.log(error);
                            return reject(new Error(messaggi.CREAZIONE_GIOCO_ERROR));
                        } 
                        return resolve(); 
                    })
            })
            .catch(error => { return reject(error); });
    })
}


/**
 * Ritorna all'Admim della Piattaforma le materie dei giochi (Cla)
 */
exports.getListaMaterie = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id,nome from public.materia',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Crea una materia 
 */
exports.creaMateria = (nome) => {
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.materia (nome) values ($1) RETURNING id',[nome],  //RETURNING serve per restituire id della materia inserita
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Restituisce il nome della materia dato il suo id; 
 */
exports.getNomeMateria = (id) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select materia.nome from materia join giochi on materia.id = giochi.id_materia and materia.id = $1',
          [id],  (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Restituisce l'id della materia dato il suo nome 
 */
exports.getIdMateria = (nome) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id from public.materia where nome=$1',
          [nome],  (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}




/**
 * Ritorna all'Admim della Piattaforma le categorie dei giochi
 */
exports.getListaCategorie = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id, nome from public.categoria',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Crea una categoria 
 */
exports.creaCategoria = (nome) => {
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.categoria (nome) values ($1) RETURNING id',[nome],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Restituisce il nome della categoria dato il suo id; 
 */
exports.getNomeCategoria = (id) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select categoria.nome from categoria join giochi on categoria.id = giochi.id_categoria and categoria.id = $1',
          [id],  (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Restituisce l'id della categoria dato il suo nome 
 */
exports.getIdCategoria = (nome) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select id from public.categoria where nome=$1',
          [nome],  (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


exports.cercaIdGiocoDaNome = (nome) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select id from public.giochi where nome = $1',[nome],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

//metodi BADGE 

/**
 * Restituisce i badge presenti nel db 
 */
exports.getListaBadge = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select * from public.badge',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Inserimento un nuovo badge nella tabella badge, restituisce l'id 
 */
exports.creaBadge = (nome, tipo, descrizione) => {
    //maca xss come su crea gioco 
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.badge (nome, tipo, descrizione) values ($1,$2,$3) RETURNING id',[nome, tipo, descrizione],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Inserimento id badge e id game nella tab giochi_badge 
 */
exports.insertGameBadge = (idGioco, idBadge) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.giochi_badge (id_gioco, id_badge) values ($1,$2)',[idGioco, idBadge],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}



exports.cercaIdBadgeDaNome = (nome) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select id from public.badge where nome = $1',[nome],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Restituisce il nome del badge dato l'id 
 */
exports.getNomeBadgeDaId = (id_badge) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select nome from public.badge join utente_badge on badge.id = utente_badge.id_badge and badge.id = $1',[id_badge],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Restituisce la lista dei badge dato l'id del gioco 
 * 
 * @param {*} idGioco da cui prendere i badge 
 * @returns lista dei badge
 */
exports.getListaBadgeDaIdGioco = (idGioco) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select badge.id, nome, tipo, descrizione from giochi_badge, badge where giochi_badge.id_gioco = $1 and giochi_badge.id_badge = badge.id',[idGioco],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Restituisce la lista dei badge dato l'username (tutti i badge conquistati da un giocatore)
 * 
 * @param {*} username username del giocatore 
 * @returns lista dei badge
 */
exports.getListaBadgeDaUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT badge.id, badge.nome, badge.descrizione, badge.tipo
            FROM badge
            JOIN utente_badge ON badge.id = utente_badge.id_badge
            WHERE utente_badge.username = $1;
        `;

        db.pool.query(query, [username], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};



/**
 * Inserimento username utente e id badge nella tab utente_badge e codice_partita 
 * 
 */
exports.insertUtenteBadge = (username, id_badge,codice_partita) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.utente_badge (username, id_badge, codice_partita) values ($1,$2,$3)',[username,id_badge,codice_partita],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


exports.verificaEsistenzaUtente = (username) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT EXISTS (SELECT 1 FROM utenti WHERE username = $1)',[username],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


exports.verificaEsistenzaOspite = (username) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('SELECT EXISTS (SELECT 1 FROM ospiti WHERE username = $1)',[username],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/** 
 *  Restituisce i badge dalla tabella utente_badge, dato l'username e il codice della partita 
 * @param username username dell'utente, codice_partita
 */
exports.getUtenteBadgeCodPartita = (username, codice_partita) => {
   //aggiungere la ricerca se il giocatore li ha conquistati i badge...
    return new Promise((resolve, reject) => {
        db.pool.query('select badge.id, badge.nome, badge.tipo, badge.descrizione from badge join utente_badge '
        + 'ON badge.id = utente_badge.id_badge and utente_badge.username = $1 and utente_badge.codice_partita = $2',[username,codice_partita],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/*
Controlla se un giocatore ha ottenuto un badge dato il codice della partita 
*/

exports.getListaBadgeUserMatch = (username, codice_partita) => {
   
    return new Promise((resolve, reject) => {
        db.pool.query('select id_badge from utente_badge where username = $1 and codice_partita = $2 ',[username,codice_partita],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

//METODI SKILL 

/**
 * Restituisce le skill presenti nel db 
 */
exports.getListaSkill = () => {
    return new Promise((resolve, reject) => {
        db.pool.query('select * from public.skill',
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Inserimento una nuova skill nella tabella skill, restituisce l'id 
 */
exports.creaSkill = (nome, tipo, descrizione) => {
    //maca xss come su crea gioco 
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.skill (nome, tipo, descrizione) values ($1,$2,$3) RETURNING id',[nome, tipo, descrizione],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Inserimento id skill e id game nella tab giochi_skill
 */
exports.insertGameSkill = (id_gioco, id_skill) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.giochi_skill (id_gioco, id_skill) values ($1,$2)',[id_gioco, id_skill],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}



exports.cercaIdSkillDaNome = (nome) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select id from public.skill where nome = $1',[nome],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Restituisce il nome della skill dato l'id 
 */
exports.getNomeSkillDaId = (id_skill) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select nome from public.skill join utente_skill on skill.id = utente_skill.id_skill and skill.id = $1',[id_skill],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}





/**
 * Restituisce la lista delle skills dato l'id del gioco 
 * 
 * @param {*} idGioco da cui prendere i badge 
 * @returns lista delle skills del gioco 
 */
exports.getListaSkillDaIdGioco = (idGioco) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select skill.id, nome, tipo, descrizione from giochi_skill, skill where giochi_skill.id_gioco = $1 and giochi_skill.id_skill = skill.id',[idGioco],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Restituisce la lista delle skill dato l'username (tutte le skill conquistate da un giocatore)
 * 
 * @param {*} username username del giocatore 
 * @returns lista delle skill 
 */
exports.getListaSkillDaUsername = (username) => {
    return new Promise((resolve, reject) => {

        const query = `
        SELECT DISTINCT skill.id, skill.nome, skill.descrizione, skill.tipo
        FROM skill
        JOIN utente_skill ON skill.id = utente_skill.id_skill
        WHERE utente_skill.username = $1;
        `;

        db.pool.query(query,[username],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/**
 * Inserimento username utente e id skill nella tab utente_skill
 */
exports.insertUtenteSkill = (username, id_skill,codice_partita) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.utente_skill (username, id_skill,codice_partita) values ($1,$2,$3)',[username, id_skill,codice_partita], 
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}



/**
 * Inserimento username utente e id skill nella tab utente_skill 
 * (NB: in questa versione prendo l'id del badge dato il nome qui dal backend )
 */
exports.insertUtenteSkill2 = (username, nome_skill, codice_partita) => {
    //maca xss
    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.utente_skill (username, id_skill, codice_partita) values ($1,(select id from skill where nome = $2 ),$3) ',[username, nome_skill ,codice_partita], 
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


/** DA TESTARE 
 *  Restituisce le skill dalla tabella utente_skill, dato l'username e il codice della partita 
 * @param username username dell'utente
 * @param codice_partita codice della partita 
 */
exports.getUtenteSkillCodPartita = (username, codice_partita) => {
   
    return new Promise((resolve, reject) => {
        db.pool.query('select skill.id, skill.nome, skill.tipo, skill.descrizione from skill, join utente_skill'
        + 'ON skill.id = utente_skill.id_skill and utente_skill.username = $1 and utente_skill.codice_partita = $2',[username,codice_partita],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}


//fine metodi skill 


//controllo se un giocatore ha ottenuto una skill dato il codice della partita 
exports.getListaSkillUserMatch = (username, codice_partita) => {
   
    return new Promise((resolve, reject) => {
        db.pool.query('select id_skill from utente_skill where username = $1 and codice_partita = $2 ',[username,codice_partita],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}
