const con = require('../database/db');

async function getEvents() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events';
        con.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventsCount() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM events';
        con.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventsByAttraction(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events WHERE mid = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventsByAttractionCount(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) as count FROM events WHERE mid = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventsByAttractionAndRange(mid, start, end) {
    return new Promise((resolve, reject) => {
        const limit = end - start + 1;
        const offset = start - 1;
        const query = `SELECT * FROM events WHERE mid = ? ORDER BY id LIMIT ?, ?`;
        
        con.query(query, [mid, offset, limit], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventsByRange(sortopt, start, end) {
    return new Promise((resolve, reject) => {
        const limit = end - start + 1;
        const offset = start - 1;
        if (sortopt == "") sortopt = "id";
        const query = `SELECT * FROM events ORDER BY ${sortopt} LIMIT ?, ?`;
        con.query(query, [offset, limit], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getEventByID(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events WHERE id = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteEvent(id) {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM events WHERE id = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function updateEvent(id, newName, newDescr, newPrice, newMID, newStartDate, newEndDate) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE events SET name = ?, description = ?, price = ?, mid = ?, start_date = ?, end_date = ? WHERE id = ?';
        con.query(query, [newName, newDescr, newPrice, newMID, newStartDate, newEndDate, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function eventNotExist(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events WHERE id = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length === 0);
            }
        });
    });
}

async function addEvent(newName, newDescr, newPrice, newMID, newStartDate, newEndDate) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO events (name, description, price, mid, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)';
        con.query(query, [newName, newDescr, newPrice, newMID, newStartDate, newEndDate], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

module.exports = {
    getEvents,
    getEventsCount,
    getEventsByAttraction,
    getEventsByAttractionCount,
    getEventsByAttractionAndRange,
    getEventsByRange,
    getEventByID,
    deleteEvent,
    updateEvent,
    eventNotExist,
    addEvent
};
