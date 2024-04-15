const db = require('../database');
const lobby = require('./lobby');
const controller = require('../controller');
const messaggi = require('../messaggi');
const game = require('./game');
/**
 * Creazione di un nuovo record nella tabella reportistica 
 * NB: in tabella i nomi sono in italiano, mentre nel codice in inglese
 */
exports.creaReportistica = (username,cod_partita,id_gioco,punteggio,domande,tempo,badges,skills) => {
    username = controller.xssSanitize(username);

    return new Promise((resolve, reject) => {
        db.pool.query('INSERT INTO public.reportistica (username,cod_partita,id_gioco,punteggio,domande,tempo,badges,skills) values ($1,$2,$3,$4,$5,$6,$7,$8) ',[username,cod_partita,id_gioco,punteggio,domande,tempo,badges,skills],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Reportistica di un certo giocatore e stesso idGioco
 * @param {*} username è l'username di un certo giocatore 
 * @param id_gioco è id del gioco 
 * @returns  reportistica di un certo giocatore e stesso idGioco
 */
exports.getReportUserIdGame = (username,id_gioco) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select * from public.reportistica where username = $1 and id_gioco = $2',[username,id_gioco],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}



/**
 * Reportistica dello stesso idGioco
 * @param id_gioco id del gioco 
 * @returns  
 */
exports.getReportIdGame = (id_gioco) => {
    
    return new Promise((resolve, reject) => {
        db.pool.query('select * from public.reportistica where id_gioco = $1',[id_gioco],  
            (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

//reportistica 

exports.getNumReportUserCategory = (username, categoria) => {
    return new Promise((resolve, reject) => {
        const query = 
        'SELECT count(*) FROM public.reportistica JOIN giochi ON reportistica.id_gioco = giochi.id AND reportistica.username = $1 '+
        'JOIN categoria ON giochi.id_categoria = categoria.id AND categoria.nome = $2';

        db.pool.query(query, [username, categoria], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};


//funzionante perfet
 exports.aggiornaReportisticaConBadge = (id_badge, username, cod_partita) => {
    return new Promise((resolve, reject) => {
       
        const query = `
        UPDATE public.reportistica 
        SET badges = CASE 
                        WHEN badges IS NOT NULL AND badges != '' THEN badges || ',' 
                        ELSE '' 
                     END 
                     || COALESCE(TRIM(BOTH '"' FROM (
                                SELECT STRING_AGG(to_json(nome)::text, ',') 
                                FROM public.badge 
                                JOIN utente_badge ON badge.id = utente_badge.id_badge 
                                WHERE badge.id = $1 AND utente_badge.codice_partita = $3
                                AND username = $2 AND cod_partita = $3
                             )), '')
        WHERE username = $2 AND cod_partita = $3 `;

    const values = [id_badge, username, cod_partita];

    db.pool.query(query, values, (error, results) => {
        if (error) {
            return reject(error);
        } else {
            return resolve(results);
        }
    });
});
};



/**
 * Aggiorna le reportistica con le skill conquistate da un giocatore 
 * @param {} id_skill ottenuta 
 * @param {*} username del giocatore 
 * @param {*} cod_partita codice della partita 
 * @returns 
 */
exports.aggiornaReportisticaConSkill = (id_skill, username, cod_partita) => {
    return new Promise((resolve, reject) => {
       
        const query = `
        UPDATE public.reportistica 
        SET skills = CASE 
                        WHEN skills IS NOT NULL AND skills != '' THEN skills || ',' 
                        ELSE '' 
                     END 
                     || COALESCE(TRIM(BOTH '"' FROM (
                                SELECT STRING_AGG(to_json(nome)::text, ',') 
                                FROM public.skill 
                                JOIN utente_skill ON skill.id = utente_skill.id_skill 
                                WHERE skill.id = $1 AND utente_skill.codice_partita = $3
                                AND username = $2 AND cod_partita = $3
                             )), '')
        WHERE username = $2 AND cod_partita = $3 `;

    const values = [id_skill, username, cod_partita];

    db.pool.query(query, values, (error, results) => {
        if (error) {
            return reject(error);
        } else {
            return resolve(results);
        }
    });
});
};



exports.aggiornaReportisticaConSkill2 = (nome_skill, username, cod_partita) => {
    return new Promise((resolve, reject) => {
       
        const query = ` 
        UPDATE public.reportistica 
        SET skills = CASE 
                WHEN skills IS NOT NULL AND skills != '' THEN skills || ',' 
                ELSE '' 
             END 
             || COALESCE(TRIM(BOTH '"' FROM (
                        SELECT STRING_AGG(to_json(skill.nome)::text, ',') 
                        FROM public.skill 
                        JOIN utente_skill ON skill.id = utente_skill.id_skill 
                        WHERE skill.nome = $1 AND utente_skill.codice_partita = $3
                        AND username = $2 AND cod_partita = $3
                     )), '')
        WHERE username = $2 AND cod_partita = $3;  `;

    const values = [nome_skill, username, cod_partita];

    db.pool.query(query, values, (error, results) => {
        if (error) {
            return reject(error);
        } else {
            return resolve(results);
        }
    });
});
};
        