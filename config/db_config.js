const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "db.ac-solutions.at",
    port: 3489,
    database: "tcstix",
    user: "tcstix",
    password: "txstix1234",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
})

module.exports = {
    pool
}