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

async function getAttractionsByRange(start, end) {
    return new Promise((resolve, reject) => {
        const limit = end - start + 1;
        const offset = start - 1;
        con.query('SELECT * FROM attractions ORDER BY id LIMIT ?, ?', [offset, limit], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getAttractionsByRangeWithFilters(start, end, sortopt, name, theme, minrev, maxrev, state, city, minrating) {
    const limit = end - start + 1;
    const offset = start - 1;
    if (sortopt == "" || sortopt == "id") sortopt = "id";
    try {
        const stateQuery = `SELECT name FROM states WHERE id = ?`;
        const cityQuery = `SELECT name FROM cities WHERE id = ?`;

        const [stateResult] = await queryAsync(stateQuery, [state]);
        const [cityResult] = await queryAsync(cityQuery, [city]);

        const stateName = stateResult.length ? stateResult[0].name : '';
        const cityName = cityResult.length ? cityResult[0].name : '';
        // todo: add stateName and cityName
        const attractionsQuery = `
            SELECT * FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND revenue >= ? 
            AND revenue <= ? 
            AND rating >= ? 
            ORDER BY ${sortopt} 
            LIMIT ?, ? 
        `;
        const [attractions] = await queryAsync(attractionsQuery, [name, name, theme, theme, minrev, maxrev, minrating, offset, limit]);
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

async function getAttractionsCountWithFilters(name, theme, minrev, maxrev, state, city, minrating) {
    try {
        const stateQuery = `SELECT name FROM states WHERE id = ?`;
        const cityQuery = `SELECT name FROM cities WHERE id = ?`;

        const [stateResult] = await queryAsync(stateQuery, [state]);
        const [cityResult] = await queryAsync(cityQuery, [city]);

        const stateName = stateResult.length ? stateResult[0].name : '';
        const cityName = cityResult.length ? cityResult[0].name : '';
        // todo: add stateName and cityName
        const attractionsQuery = `
            SELECT COUNT(*) as count FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND revenue >= ? 
            AND revenue <= ? 
            AND rating >= ? 
        `;
        const [count] = await queryAsync(attractionsQuery, [name, name, theme, theme, minrev, maxrev, minrating]);
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

async function updateAttraction(id, newName, newCity, newLat, newLng, newRevenue, newTheme, newRating, newPhotoPath) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE attractions SET name = ?, city = ?, latitude = ?, longitude = ?, revenue = ?, theme = ?, rating = ?, photo_path = ? WHERE id = ?';
        con.query(query, [newName, newCity, newLat, newLng, newRevenue, newTheme, newRating, newPhotoPath, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function addAttraction(name, city, lat, lng, revenue, theme, rating, photo_path) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO attractions (name, city, latitude, longitude, revenue, theme, rating, photo_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        con.query(query, [name, city, lat, lng, revenue, theme, rating, photo_path], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

module.exports = {
    getAttractions,
    getAttractionsByRange,
    getAttractionsByRangeWithFilters,
    getAttractionsCountWithFilters,
    getAttractionByID,
    deleteAttraction,
    updateAttraction,
    addAttraction
};