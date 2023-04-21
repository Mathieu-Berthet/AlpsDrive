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

app.post('/api/drive', (req, res, next) => {
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
    //next();
});

//async
app.get('/api/drive' , async (req, res, next) => {

    let files = await fs.promises.readdir(os.tmpdir(), {withFileTypes : true});
    //fs.statSync(os.tmpdir())// Pour la size
    const fileList = files.map((fileName) => {
        if(fileName.isDirectory())
        {
            return {
                "name" : fileName.name,
                "isFolder" : fileName.isDirectory(),
            }
        }
        else
        {
            return {
                "name" : fileName.name,
                "isFolder" : fileName.isDirectory(),
                "size" : fs.statSync(os.tmpdir())['size']// Pour la size
            }
        }
    });

    res.status(200).json(fileList);

});


module.exports = app;