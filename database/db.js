var mysql = require('mysql2');

var db = mysql.createPool({
    
    host: "localhost",
    database: "smartcall",
    user: "root",
    password: "zain_12345",
    port: "3306"
});

db.getConnection((err,connection)=> {
  if(err)
  {
    throw err;
  }

  console.log('Database connected successfully');

  connection.release();
});

module.exports = db;
