const express = require('express');
const os = require('node:os');
const fs = require('node:fs');
const bb = require('express-busboy');
const app = express();


bb.extend(app, {
    upload: true,
    path: os.tmpdir(),
});

app.use((req, res, next) => {
    //console.log("coucou : " , express.static('frontend'));
    //res.end("vous etes sur le serveur");
    next();
})

app.use(express.static('frontend'));


let myRegex = /^[a-zA-Z]+$/;

////////////////////////////////// METHOD POST ///////////////////////////////////////////////////
//POST : Creation d'un répertoire
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
        res.status(201).send(os.tmpdir());
    }
    else
    {
        console.log("Test echoué");
        res.status(400);
    }
});

//POST : Creation dossier dans un dossier
app.post('/api/drive/:folder', (req, res, next) => {
    let folderName = req.params.folder;
    if(fs.existsSync(os.tmpdir() + "/" + folderName))
    {
        if(myRegex.test(req.query.name))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.mkdir(os.tmpdir() + "/" + folderName + "/" + req.query.name, (err) => {
                if(err)
                {
                    console.log(err);
                }
            });
            res.status(201).send(os.tmpdir() + "/" + folderName);
        }
        else
        {
            console.log("Test echoué");
            res.status(400);
        }
    }
    else
    {
        console.log("Le fichier ou répertoire n'existe pas")
        res.status(404);
    }

})


//////////////////////////////////  METHOD GET ///////////////////////////////////////////////////

//GET tous les fichiers et dossiers d'un répertoire
app.get('/api/drive' , async (req, res, next) => {

    let files = await fs.promises.readdir(os.tmpdir(), {withFileTypes : true});
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
                "size" : fs.statSync(os.tmpdir() + "/" + fileName.name)['size']// Pour la size
            }
        }
    });

    res.status(200).json(fileList);

});


//GET pour un seul item. Si c'est un répertoire, cela affiche les dossiers et fichiers dedans, si c'est un fichier, affiche les infos du fichier
app.get('/api/drive/:name', (req, res, next) => {
    let nameFile = req.params.name;
    if(fs.existsSync(os.tmpdir() + "/" + nameFile))
    {
        fs.stat(os.tmpdir() + "/" + nameFile, async(err, fold) => {
            if (fold.isDirectory())
            {
                //Lire un dossier
                let folders = await fs.promises.readdir(os.tmpdir() + "/" + nameFile, {withFileTypes: true});
                const folderList = folders.map((folderName) => {
                    if (folderName.isDirectory())
                    {
                        return {
                            "name": folderName.name,
                            "isFolder": folderName.isDirectory(),
                        }
                    }
                    else
                    {
                        return {
                            "name": folderName.name,
                            "isFolder": folderName.isDirectory(),
                            "size": fs.statSync(os.tmpdir() + "/" + nameFile + "/" + folderName.name)['size']// Pour la size
                        }
                    }
                });
                res.status(200).json(folderList);
            }
            else
            {
                //Lire un fichier
                let myFile = fs.readFileSync(os.tmpdir() + "/" + nameFile, {encoding: 'utf8'});
                res.status(200).send(myFile);
            }
        })
    }
    else
    {
        console.log("Le dossier ou répertoire n'existe pas");
        res.status(404);
    }

});



//////////////////////////////////  METHOD DELETE ///////////////////////////////////////////////////
// A faire : Tester si c'est un fichier ou un dossier

//DELETE : Supression d'un répertoire
app.delete('/api/drive/:name', (req, res, next) => {
    let nameFile = req.params.name;
    let newFileName = nameFile.replace('.', '');
    if(myRegex.test(newFileName))
    {
        console.log("test réussi");
        //Rajouter un test pour l'existance du dossier
        fs.stat(os.tmpdir() + "/" + nameFile, (err, fold) => {
            if (fold.isDirectory())
            {
                fs.rmdir(os.tmpdir() + "/" + nameFile, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.status(201).send(os.tmpdir());
            }
            else
            {
                fs.rm(os.tmpdir() + "/" + nameFile, (err) => {
                    if (err) {
                        console.log(err);
                    }
                });
                res.status(201).send(os.tmpdir());
            }
        });
    }
    else
    {
        console.log("Test echoué");
        res.status(400);
    }
});

//DELETE : Supression d'un dossier dans un dossier
app.delete('/api/drive/:folder/:name', (req, res, next) => {
    let folderName = req.params.folder;
    let name = req.params.name;
    if(fs.existsSync(os.tmpdir() + "/" + folderName))
    {
        let newFileName = name.replace('.', '');
        if(myRegex.test(newFileName))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.stat(os.tmpdir() + "/" + folderName + "/" + name, (err, fold) => {
                if (fold.isDirectory())
                {
                    fs.rmdir(os.tmpdir() + "/" + folderName + "/" + name, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.status(201).send(os.tmpdir());
                }
                else
                {
                    fs.rm(os.tmpdir() + "/" + folderName + "/" + name, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.status(201).send(os.tmpdir());
                }
            });
        }
        else
        {
            console.log("Test echoué");
            res.status(400);
        }
    }
    else
    {
        console.log("Le fichier ou répertoire est déjà supprimé");
        res.status(404);
    }

})

//////////////////////////////////  METHOD PUT ///////////////////////////////////////////////////
app.put('/api/drive', (req, res, next) =>
{

    res.setHeader('Content-Type', 'multipart/form-data');
    let fileName = req.files.file.filename;
    if(fileName)
    {
        console.log("coucou");
        fs.copyFileSync(req.files.file.file, os.tmpdir() + "/" + fileName);
        res.status(201).send(os.tmpdir());
    }
    else
    {
        console.log("pas de fichier");
        res.status(400).send(os.tmpdir());
    }
});

app.put('/api/drive/:folder', (req, res, next) => {
    let folderName = req.params.folder;
    if(fs.existsSync(os.tmpdir() + "/" + folderName))
    {
        let fileFName = req.files.file.filename;
        if (fileFName)
        {
            console.log("coucou");
            fs.copyFileSync(req.files.file.file, os.tmpdir() + "/" + folderName + "/" + fileFName);
            res.status(201).send(os.tmpdir() + "/" + folderName);
        }
        else
        {
            console.log("pas de fichier");
            res.status(400).send(os.tmpdir() + "/" + folderName);
        }
    }
    else
    {
        console.log("Le répertoire n'existe pas");
        res.status(404);
    }
});


module.exports = app;