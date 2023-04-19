//console.log("Main");

require('./server.js');

const http = require('http');

const server = http.createServer((req, res) => {
    res.end("Voila la reponse du serveur !!");
});

server.listen(process.env.PORT || 3000);