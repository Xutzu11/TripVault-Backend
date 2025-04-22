const con = require('../database/db');
const jwt = require('jsonwebtoken');

async function getUsers() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users';
        con.query(query, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve({...result});
            }
        });
    });
}

async function getUser(username) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        con.query(query, [username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result.length == 0) resolve(null);
                else resolve({...result[0]});
            }
        });
    });
}

async function createUser(username, fname, lname, email, role, password) {
    return new Promise((resolve, reject) => {
        const query = "INSERT INTO users (username, first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)";
        con.query(query, [username, fname, lname, email, password, role], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function updateUser(id, username, fname, lname, email, role) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET username = ?, first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?';
        con.query(query, [username, fname, lname, email, role, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.affectedRows);
            }
        });
    });
}

async function userNotExists(id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ?';
        con.query(query, [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length === 0);
            }
        });
    });
}

async function userAlreadyExists(username, email, id) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND id != ?';
        con.query(query, [username, email, id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.length !== 0);
            }
        });
    });
}

async function verifyAdmin(token) {
    if (!token) {
        return null;
    }
    try {
        const user = jwt.verify(token, 'admin');
        return user;
    } 
    catch (error) {
        return null;
    }
}

async function verifyUser(token) {
    if (!token) {
        return null;
    }
    try {
        const user = jwt.verify(token, 'user');
        return user;
    } 
    catch (error) {
        return null;
    }
}

async function verifyLoggedIn(token) {
    var user = await verifyUser(token);
    var admin = await verifyAdmin(token);
    if (user) {
        return user;
    }
    if (admin) {
        return admin;
    }
    return null;
}

async function getUsers() {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM Users', (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

async function getUserByID(id) {
    return new Promise((resolve, reject) => {
        con.query('SELECT * FROM Users WHERE id = ?', [id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    userNotExists,
    userAlreadyExists,
    verifyAdmin,
    verifyUser,
    verifyLoggedIn,
    getUsers,
    getUserByID
};