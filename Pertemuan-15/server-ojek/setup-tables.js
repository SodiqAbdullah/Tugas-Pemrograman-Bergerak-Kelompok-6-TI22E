const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,
  database: 'db_ojeksiber'
});

conn.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
  
  console.log('Connected to db!');
  
  const sql = `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    saldo INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`;
  
  conn.query(sql, (e, r) => {
    if (e) {
      console.log(e);
    } else {
      console.log('Table created!');
      
      conn.query("TRUNCATE TABLE users", (e3, r3) => {
        conn.query("INSERT INTO users (username, password, saldo) VALUES ('admin', 'rahasia123', 0), ('driver01', 'driver123', 50000), ('user02', 'user123', 25000)", (e2, r2) => {
          if (e2) {
            console.log(e2);
          } else {
            console.log('Data inserted!');
            console.log('Users:');
            conn.query("SELECT * FROM users", (e4, r4) => {
              console.log(r4);
              conn.end();
            });
          }
        });
      });
    }
  });
});
