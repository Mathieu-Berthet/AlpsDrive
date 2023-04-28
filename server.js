const express = require('express');
const os= require('node:os');
const fs= require('node:fs');
const bb= require('express-busboy');
const admz = require('adm-zip');
const app = express();


bb.extend(app, {
    upload: true,
    path: os.tmpdir(),
});

app.use((req, res, next) => {
    next();
})

app.use(express.static('frontend'));

const myPath= os.tmpdir();

let myRegex= /^[a-zA-Z0-9]+$/;


////////////////////////////////// METHOD POST ///////////////////////////////////////////////////
//POST : Creation de dossier
app.post('/api/drive/*', (req, res) => {
    let folderName = req.params[0];
    if(fs.existsSync(myPath + "/" + folderName))
    {
        if(myRegex.test(req.query.name))
        {
            console.log("test réussi");
            //Rajouter un test pour l'existance du dossier
            fs.mkdir(myPath + "/" + folderName + "/" + req.query.name, (err) => {
                if(err)
                {
                    console.log(err);
                }
            });
            res.status(201).send(myPath + "/" + folderName);
        }
        else
        {
            console.log("Test echoué");
            res.status(400).send("Le nom contient des caractères non alpha-numériques");
        }
    }
    else
    {
        console.log("Le fichier ou répertoire n'existe pas");
        res.status(404).send("Le fichier ou répertoire n'existe pas");
    }

})


//////////////////////////////////  METHOD GET ///////////////////////////////////////////////////
//GET pour un seul item. Si c'est un répertoire, cela affiche les dossiers et fichiers dedans, si c'est un fichier, affiche les infos du fichier
app.get('/api/drive/*', (req, res) => {
    let nameFile = req.params[0];
    if(fs.existsSync(myPath + "/" + nameFile))
    {
        fs.stat(myPath + "/" + nameFile, async(err, fold) => {
            if (fold.isDirectory())
            {
                //Lire un dossier
                let folders= await fs.promises.readdir(myPath + "/" + nameFile, {withFileTypes: true});
                const folderList= folders.map((folderName) => {
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
                            "size": fs.statSync(myPath + "/" + nameFile + "/" + folderName.name)['size']// Pour la size
                        }
                    }
                });
                res.status(200).json(folderList);
            }
            else
            {
                //Lire un fichier
                let myFile= fs.readFileSync(myPath + "/" + nameFile, {encoding: 'utf8'});
                let zp = new admz();
                const data = zp.toBuffer();
                res.setHeader('Content-Type', 'application/octet-stream, application/zip');
                res.setHeader('Content-Disposition', `attachement; filename=${nameFile}`);
                res.setHeader('Content-Length', data.length);
                res.status(200).send(data);
            }
        })
    }
    else
    {
        console.log("Le dossier ou répertoire n'existe pas");
        res.status(404).send("Le fichier ou répertoire n'existe pas");
    }

});

//Test le téléchargement en .zip
/*app.get('/api/drive/*', (req, res) => {
    //let to_zip = fs.readdirSync(myPath);
    //res.sendFile(myPath + '/' + req.params[0]);

    let name = req.params[0];
    let zp = new admz();

    for(let k = 0; k < to_zip.length; k++)
    {
        console.log("coucou");
        zp.addLocalFile(myPath + '/' + to_zip[k]);
    }

    const data = zp.toBuffer();
    res.set('Content-Type', 'application/octet-stream, application/zip');
    res.set('Content-Disposition', `attachement; filename=${name}`);
    res.set('Content-Length', data.length);

    res.send(data);


})*/


//////////////////////////////////  METHOD DELETE ///////////////////////////////////////////////////
//DELETE : Supression d'un répertoire
app.delete('/api/drive/*', (req, res) => {
    let nameFile = req.params[0];

    if(fs.existsSync(myPath + "/" + nameFile))
    {
        let newFileName = replaceAll(/[./-_* ]/, '', nameFile);
        if (myRegex.test(newFileName))
        {
            console.log("Test réussi");
            fs.stat(myPath + "/" + nameFile, (err, fold) => {
                if (fold.isDirectory())
                {
                    fs.rmdir(myPath + "/" + nameFile, (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                    res.status(200).send(myPath + "/" + nameFile);
                }
                else
                {
                    fs.rm(myPath + "/" + nameFile, (err) => {
                        if (err)
                        {
                            console.log(err);
                        }
                    });
                    res.status(200).send(myPath + "/" + nameFile);
                }
            });
        }
        else
        {
            console.log("Test echoué");
            res.status(400).send("Le nom contient des caractères non alpha-numériques");
        }
    }
    else
    {
        console.log("Le dossier ou répertoire n'existe pas");
        res.status(404).send("Le dossier ou répertoire n'existe pas");
    }
});

//////////////////////////////////  METHOD PUT ///////////////////////////////////////////////////
app.put('/api/drive/*', (req, res) => {

    res.setHeader('Content-Type', 'multipart/form-data');

    let folderName = req.params[0];
    if(fs.existsSync(myPath + "/" + folderName))
    {
        let fileFName = req.files.file.filename;
        if (fileFName)
        {
            console.log("Test réussi");
            fs.copyFileSync(req.files.file.file, myPath + "/" + folderName + "/" + fileFName);
            res.status(201).send(myPath + "/" + folderName);
        }
        else
        {
            console.log("pas de fichier");
            res.status(400).send("pas de fichier");
        }
    }
    else
    {
        console.log("Le répertoire n'existe pas");
        res.status(404).send("Le répertoire n'existe pas");
    }
});


function replaceAll(recherche, remplacement, chainToChange)
{
    return chainToChange.split(recherche).join(remplacement);
}

module.exports = app;