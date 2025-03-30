const dbconfig = require('../../dbconfig.json')
const mysql = require('mysql2');

var con = mysql.createConnection({
    host: dbconfig.HOST,
    user: dbconfig.USER,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE,
    port: dbconfig.PORT
});

module.exports = con;