const express = require("express")
const cors = require("cors")
var mysql = require('mysql');
const app = express()


var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}


const bddDuClochard = [["root","root"],["user","root"],["erwan","oklm"],["yan","18544"]]
// a modifier en fonction de l'hebergeur
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'user',
    password : 'root',
    database : 'pollen'
});
// on lance la connexion a la bdd des le chargement de l'app
// on ne l'arrete jamais ainsi pas besoin de la recharger
connection.connect(err => {
    console.log("")
    console.log("+===============+")
    console.log("| BDD connexion |")
    console.log("+===============+")
    if(err===null){
        console.log("Connexion a la BDD : Ok")
    }else{
        console.log("Connexion a la BDD : Failed")
        console.log(connection.config)
        console.log("")
        console.log("Error displayed by the serv => " + err)
    }
})

app.get("/",cors(corsOptions),(req,res)=>{

    var myQuery = "select secondName from User"

    connection.query(myQuery, function (error, results, fields) {
        console.log("")
        console.log("+=============+")
        console.log("| BDD request |")
        console.log("+=============+")
        if(error===null){
            console.log(myQuery)
            console.log("Requete a la bdd : Ok")
            res.json({results})
        }else{
            console.log("Requete a la bdd : Failed")
            console.log("Requete : \"" + myQuery+"\"")
            console.log("Error displayed by the serv => " + error)
        }
    });
})

// test connexion of the user
app.get("/users/:userName/:passWord",cors(corsOptions),(req,res)=>{
    const {userName, passWord} = req.params
    // res.json({userName,passWord})
    // res.json({bddDuClochard})
    for (let i = 0; i < bddDuClochard.length; i++) {
        if(bddDuClochard[i][0]===userName){
            if(bddDuClochard[i][1]===passWord){
                res.json({connexion:true})
                return 0
            }
        }
    }
    res.json({connexion:false})
})


// 404 error
app.use(cors(corsOptions),function(req, res, next){
    res.status(404)
    res.json({
        "Status":404,
        "Description":'Page not found !'
        })
})

// connection au port d'ecoute
app.listen(8000,()=>{
    console.log("++============================++")
    console.log("||                            ||")
    console.log("||   localhost:8000 tu coco   ||")
    console.log("||                            ||")
    console.log("++============================++")
})
