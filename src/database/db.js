const { loadConfig } = require('../../utils/configPathResolve.js');
const dbconfig = loadConfig('dbconfig.json');
const mysql = require('mysql2');

var con = mysql.createConnection({
    host: dbconfig.HOST,
    user: dbconfig.USER,
    password: dbconfig.PASSWORD,
    database: dbconfig.DATABASE,
    port: dbconfig.PORT
});

module.exports = con;