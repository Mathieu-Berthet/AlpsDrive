const express = require('express');

const app = express();

app.use((req, res, next) => {
    //console.log("coucou : " , express.static('frontend'));
    //res.end("vous etes sur le serveur");
    next();
})

app.use(express.static('frontend'));

/*app.get('/api/drive' , (req, res, next) => {
   //res.status(200)
});*/

module.exports = app;