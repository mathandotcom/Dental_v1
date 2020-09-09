const db = require('./authpool');

db.execute('select * from user')
    .then(results => {
        console.log(results);
    })
    .catch(err => {
        console.log(err);
    });
