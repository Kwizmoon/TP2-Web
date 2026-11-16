const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'DexAppBD',
    charset: 'utf8mb4'  
}).promise(); // garantit que le pool supporte les promesses (async/await)

module.exports = pool;