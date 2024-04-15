const db = require('./database');
const utente = require('./utente');
const controller = require('./controller');
const messaggi = require('./messaggi');

/**
 * //TODO commentare
 * @param {string} username 
 */
function deleteUserQuery(username) {
    return new Promise((resolve, reject) => {
        db.pool.query('DELETE FROM public.utenti WHERE username = $1',
            [username], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(new Error('Errore nell\'eliminazione dell\'utente: ' + username));
                } else resolve();
            });
    })
}

/**
 * Ritorna la lista degli Utenti che hanno tipo diverso da "ADMIN".
 * @param {*} username L'username del admin che fa la richiesta
 * @returns il risultato della query
 */
exports.getUtenti = (username) => {
    return new Promise((resolve, reject) => {
        db.pool.query('select username, nome, cognome, tipo from public.utenti where username <> $1',
            [username], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}

/**
 * Elimina un gruppo di Utenti.
 * @param {*} utenti Utenti da eliminare
 */
exports.eliminaUtenti = (utenti) => {
    const usersToDelete = utenti.split(",");
    var promises = [];
    usersToDelete.forEach(username => { promises.push(deleteUserQuery(username)) });
    return Promise.all(promises);
}

/**
 * Elimina un gioco.
 * @param {*} id L'id del gioco da eliminare.
 */
exports.deleteGame = (id) => {
    //TODO refactor con game
    return new Promise((resolve, reject) => {
        db.pool.query('delete from public.giochi where id = $1',
            [id], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(new Error("Errore nell'eliminazione del gioco: " + id));
                } else
                    return resolve();
            });
    })
}

/**
 * Modifica le Informazioni di un Utente.
 * @param {string} username Username dell'Utente da modificare
 * @param {string} newUsername Nuovo Username
 * @param {string} nome Nuovo Nome da impostare
 * @param {string} cognome Nuovo Cognome da impostare
 */
exports.modificaUtente = (username, newUsername, nome, cognome) => {
    return new Promise((resolve, reject) => {
        if (controller.controllaString(username))
            throw new Error("L'username non è valido");
        if (controller.controllaString(newUsername))
            throw new Error("Il nuovo username non è valido");
        if (controller.controllaString(nome))
            throw new Error("Il nuovo nome non è valido");
        if (controller.controllaString(cognome))
            throw new Error("Il nuovo cognome non è valido");

        username = controller.xssSanitize(username);
        newUsername = controller.xssSanitize(newUsername);
        nome = controller.xssSanitize(nome);
        cognome = controller.xssSanitize(cognome);

        if (username === newUsername)
            utente.modificaNomeCognome(username, nome, cognome)
                .then(_ => resolve())
                .catch(error => { return reject(error); });
        else {
            utente.modificaUsername(username, newUsername)
                .then(_ => { return utente.modificaNomeCognome(newUsername, nome, cognome) })
                .then(_ => resolve())
                .catch(error => { return reject(error); });
        }
    })
}

//TODO: fare metodo e REST che modifica il tipo


/**
 * Elimina una materia dato il suo nome 
 * @param {*} nome Il nome della materia da eliminare.
 */
exports.eliminaMateria = (nome) => {
    //TODO refactor con game
    return new Promise((resolve, reject) => {
        db.pool.query('delete from public.materia where nome = $1',
            [nome], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(new Error("Errore nell'eliminazione della materia: " + nome));
                } else
                    return resolve();
            });
    })
}


/**
 * Elimina una categoria dato il suo nome 
 * @param {*} nome Il nome della categoria da eliminare.
 */
exports.eliminaCategoria = (nome) => {
    return new Promise((resolve, reject) => {
        db.pool.query('delete from public.categoria where nome = $1',
            [nome], (error, results) => {
                if (error) {
                    console.log(error);
                    return reject(new Error("Errore nell'eliminazione della categoria: " + nome));
                } else
                    return resolve();
            });
    })
}

/**
 * Ritorna la reportistica di un gioco 
 * Reportistica dello stesso idGioco dato il nome 
 * @returns il risultato della query
 */
//funziona ok 
exports.getReportisticaGame = (nome) => {
    return new Promise((resolve, reject) => {

        const query = `
        select r.username, r.cod_partita, r.id_gioco, r.punteggio, r.domande, r.tempo, r.badges, r.skills 
        from reportistica as r join giochi on r.id_gioco = giochi.id 
        AND r.id_gioco = (select giochi.id from giochi where giochi.nome = $1) `

        db.pool.query(query,[nome], (error, results) => {
                if (error)
                    return reject(error);
                else
                    return resolve(results);
            });
    })
}
