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

async function addEvent(name, description, price, attraction_id, start_date, end_date) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO events (name, description, price, attraction_id, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)';
        con.query(query, [name, description, price, attraction_id, start_date, end_date], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function getFilteredEvents(attractionID, username, name, maxPrice, state, city, sortOpt, start, end) {
    return new Promise((resolve, reject) => {
        const limit = end - start + 1;
        const offset = start - 1;
        const values = [];

        let query = `
            SELECT e.* FROM events e
            JOIN attractions a ON e.attraction_id = a.id
            JOIN cities c ON a.city_id = c.id
            WHERE 1=1
        `;

        if (attractionID) {
            query += ' AND e.attraction_id = ?';
            values.push(attractionID);
        }
        if (username) {
            query += ' AND a.username = ?';
            values.push(username);
        }
        if (name) {
            query += ' AND e.name LIKE ?';
            values.push(`%${name}%`);
        }
        if (!isNaN(maxPrice)) {
            query += ' AND e.price <= ?';
            values.push(maxPrice);
        }
        if (state) {
            query += ' AND c.state_id = ?';
            values.push(state);
        }
        if (city) {
            query += ' AND a.city_id = ?';
            values.push(city);
        }

        if (!['name', 'price', 'id'].includes(sortOpt)) sortOpt = 'id';
        query += ` ORDER BY e.${sortOpt} LIMIT ?, ?`;
        values.push(offset, limit);

        con.query(query, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

async function getFilteredEventsCount(attractionID, username, name, maxPrice, state, city) {
    return new Promise((resolve, reject) => {
        const values = [];

        let query = `
            SELECT COUNT(*) as count FROM events e
            JOIN attractions a ON e.attraction_id = a.id
            JOIN cities c ON a.city_id = c.id
            WHERE 1=1
        `;

        if (attractionID) {
            query += ' AND e.attraction_id = ?';
            values.push(attractionID);
        }
        if (username) {
            query += ' AND a.username = ?';
            values.push(username);
        }
        if (name) {
            query += ' AND e.name LIKE ?';
            values.push(`%${name}%`);
        }
        if (!isNaN(maxPrice)) {
            query += ' AND e.price <= ?';
            values.push(maxPrice);
        }
        if (state) {
            query += ' AND c.state_id = ?';
            values.push(state);
        }
        if (city) {
            query += ' AND a.city_id = ?';
            values.push(city);
        }
        con.query(query, values, (err, result) => {
            if (err) reject(err);
            else resolve(result[0].count);
        });
    });
}

async function checkEventAlreadyExist(name, price, start_date, end_date, attraction_id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM events WHERE name = ? AND attraction_id = ? AND price = ? AND start_date = ? AND end_date = ?';
        const values = [name, attraction_id, price, start_date, end_date];
        con.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length !== 0);
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
    addEvent,
    getFilteredEvents,
    getFilteredEventsCount,
    checkEventAlreadyExist
};
