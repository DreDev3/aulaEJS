const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'produtos_db'
});

connection.connect(err => {
  if (err) {
    console.log('Errp ao conectar ao MYSQL', err.message);
    return;
  }

  console.log('Conectado ao MYSQL');

});

module.exports = connection;