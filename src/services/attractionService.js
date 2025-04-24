const con = require('../database/db');

async function getAttractions() {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM attractions', (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getAttractionsByRangeWithFilters(username, start, end, sortopt, name, theme, state, city, minrating) {
    const limit = end - start + 1;
    const offset = start - 1;
    if (sortopt == "" || sortopt == "id") sortopt = "id";
    try {
        var locationCondition, usernameCondition, queryParams;
        queryParams = [name, name, theme, theme, minrating];
        if (username != null) {
            usernameCondition = `username = ?`;
            queryParams = [...queryParams, username];
        }
        else {
            usernameCondition = `1=1`;
        }
        if (state != 0 && city != 0) {
            locationCondition = `city_id = ?`;
            queryParams = [...queryParams, city];
        }
        else if (state != 0) {
            locationCondition = `city_id IN (SELECT id FROM cities WHERE state_id = ?)`;
            queryParams = [...queryParams, state];
        }
        else {
            locationCondition = `1=1`;
        }
        queryParams = [...queryParams, offset, limit];
        const attractionsQuery = `
            SELECT * FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND rating >= ? 
            AND (${usernameCondition})
            AND (${locationCondition})
            ORDER BY ${sortopt} 
            LIMIT ?, ? 
        `;
        const [attractions] = await queryAsync(attractionsQuery, queryParams);
        return attractions;
    } catch (error) {
        throw error;
    }
}

function queryAsync(query, params) {
    return new Promise((resolve, reject) => {
        con.query(query, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve([results]);
            }
        });
    });
}

async function getAttractionsCountWithFilters(username, name, theme, state, city, minrating) {
    try {
        var locationCondition, usernameCondition, queryParams;
        queryParams = [name, name, theme, theme, minrating];
        if (username != null) {
            usernameCondition = `username = ?`;
            queryParams = [...queryParams, username];
        }
        else {
            usernameCondition = `1=1`;
        }
        if (state != 0 && city != 0) {
            locationCondition = `city_id = ?`;
            queryParams = [...queryParams, city];
        }
        else if (state != 0) {
            locationCondition = `city_id IN (SELECT id FROM cities WHERE state_id = ?)`;
            queryParams = [...queryParams, state];
        }
        else {
            locationCondition = `1=1`;
        }
        const attractionsQuery = `
            SELECT COUNT(*) as count FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND rating >= ? 
            AND (${usernameCondition})
            AND (${locationCondition})
        `;
        const [count] = await queryAsync(attractionsQuery, queryParams);
        return count[0].count;
    } catch (error) {
        throw error;
    }
}

async function getAttractionByID(id) {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM attractions WHERE id = ?', [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function deleteAttraction(id) {
    return new Promise((resolve, reject) => {
        con.query('DELETE FROM attractions WHERE id = ?', [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function updateAttraction(attraction_id, name, theme, revenue, rating, city_id, latitude, longitude, photo_path) {
    return new Promise((resolve, reject) => {
        var query = 'UPDATE attractions SET name = ?, theme = ?, city_id = ?, revenue = ?, rating = ?, latitude = ?, longitude = ?';
        values = [name, theme, city_id, revenue, rating, latitude, longitude];
        if (photo_path != null) {
            query += ', photo_path = ?';
            values.push(photo_path);
        }
        query += ' WHERE id = ?';
        values.push(attraction_id);
        con.query(query, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function addAttraction(username, name, theme, revenue, rating, city_id, latitude, longitude, photo_path) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO attractions (username, name, city_id, theme, revenue, rating, latitude, longitude, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        con.query(query, [username, name, city_id, theme, revenue, rating, latitude, longitude, photo_path], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function checkAttractionExists(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM attractions WHERE id = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length !== 0);
            }
        });
    });
}

module.exports = {
    getAttractions,
    getAttractionsByRangeWithFilters,
    getAttractionsCountWithFilters,
    getAttractionByID,
    deleteAttraction,
    updateAttraction,
    addAttraction,
    checkAttractionExists
};