const con = require('../database/db');

async function getStates() {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM states`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getCitiesByState(state_id) {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM cities WHERE state_id = ${state_id}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    getCitiesByState,
    getStates
};