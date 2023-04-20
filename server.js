const express = require('express');
const os = require('node:os');
const fs = require('node:fs');
const app = express();

app.use((req, res, next) => {
    //console.log("coucou : " , express.static('frontend'));
    //res.end("vous etes sur le serveur");
    next();
})

app.use(express.static('frontend'));


let myRegex = /^[a-zA-Z]+$/;
//console.log(os.tmpdir());
app.post('/api/drive', (req, res, next) => {
    console.log("coucou");
    console.log(req.query.name);
    if(myRegex.test(req.query.name))
    {
        console.log("test réussi");
        //Rajouter un test pour l'existance du dossier
        fs.mkdir(os.tmpdir() + "/" + req.query.name, (err) => {
            if(err)
            {
                console.log(err);
            }
        });
        res.status(201);
    }
    else
    {
        console.log("Test echoué");
        res.status(400);
    }
    next();
});

app.get('/api/drive' , (req, res, next) => {
    let folders = {};
    /*const folders = [
        {
            name: "Dossier",
            isFolder: true,
        },
        {
            name: "fichier",
            size: 1204,
            isFolder: false,
        },
    ];
    res.status(200).json(folders);*/
    fs.readdir(os.tmpdir(), (error, files) => {
        console.log("lecture");
        console.log("fichier : ", files);
        console.log("obj : ", folders);
        folders = files;
        console.log("obj rempli : ", folders);
    });
   res.status(200).json(folders);
});


module.exports = app;