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

async function getAttractionsByRangeWithFilters(start, end, sortopt, name, theme, state, city, minrating) {
    const limit = end - start + 1;
    const offset = start - 1;
    if (sortopt == "" || sortopt == "id") sortopt = "id";
    try {
        var locationCondition, queryParams;
        if (state != 0 && city != 0) {
            locationCondition = `city_id = ?`;
            queryParams = [name, name, theme, theme, city, minrating, offset, limit];
        }
        else if (state != 0) {
            locationCondition = `city_id IN (SELECT id FROM cities WHERE state_id = ?)`;
            queryParams = [name, name, theme, theme, state, minrating, offset, limit];
        }
        else {
            locationCondition = `1=1`;
            queryParams = [name, name, theme, theme, minrating, offset, limit];
        }
    
        const attractionsQuery = `
            SELECT * FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND (${locationCondition})
            AND rating >= ? 
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

async function getAttractionsCountWithFilters(name, theme, state, city, minrating) {
    try {
        var locationCondition, queryParams;
        if (state != 0 && city != 0) {
            locationCondition = `city_id = ?`;
            queryParams = [name, name, theme, theme, city, minrating];
        }
        else if (state != 0) {
            locationCondition = `city_id IN (SELECT id FROM cities WHERE state_id = ?)`;
            queryParams = [name, name, theme, theme, state, minrating];
        }
        else {
            locationCondition = `1=1`;
            queryParams = [name, name, theme, theme, minrating];
        }
        const attractionsQuery = `
            SELECT COUNT(*) as count FROM attractions 
            WHERE (? LIKE CONCAT('%', name, '%') OR name LIKE CONCAT('%', ?, '%'))
            AND (? LIKE CONCAT('%', theme, '%') OR theme LIKE CONCAT('%', ?, '%'))
            AND (${locationCondition})
            AND rating >= ? 
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