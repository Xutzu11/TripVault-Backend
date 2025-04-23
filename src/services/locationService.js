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

async function getCityByID(id) {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM cities WHERE id = ${id}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getStateByCityID(id) {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM states WHERE id = (SELECT state_id FROM cities WHERE id = ${id})`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function checkCityExists(id) {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM cities WHERE id = ${id}`, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length !== 0);
            }
        });
    });
}

module.exports = {
    getCitiesByState,
    getStates,
    getCityByID,
    getStateByCityID,
    checkCityExists
};