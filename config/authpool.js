const mysql = require('mysql2');
var pool = {};

    pool = mysql.createPool({
        host: "dentalmysql.cc6ydrz3sjwp.us-east-1.rds.amazonaws.com",
        user: "adminuser",
        password: "adminuser",
        database: "justdentaldb",
        connectionLimit: 10,
        multipleStatements: true
    });
module.exports = pool.promise();

