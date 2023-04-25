//console.log("Main");



const http = require('http');
const app = require('./server.js');
//const app = require('./test.ts');
//const app = require('./app');


app.set('port', process.env.PORT || 3000);
const server = http.createServer(app);

server.listen(process.env.PORT || 3000);