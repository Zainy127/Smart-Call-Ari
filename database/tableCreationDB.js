var mysql = require('mysql2');

var db = mysql.createPool({
    // connectionLimit:4,
    host: "127.0.0.1",
    database: "ari_cdr_raabta",
    user: "gr_replicationuser",
    password: "Switch@123@Raabta123",
    port: "6446"
});


module.exports = db;
