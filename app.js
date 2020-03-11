const express = require("express")
const bodyParser = require('body-parser');
const cors = require("cors")
var mysql = require('mysql');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

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

    var myQuery = "select * from User"

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

app.get("/users",cors(corsOptions),(req,res)=>{
    const {user, pass} = req.query
    var myQuery = "select userName,password from User"
    connection.query(myQuery, function (error, results, fields) {
        console.log("")
        console.log("+=============+")
        console.log("| BDD request |")
        console.log("+=============+")
        if(error===null){
            console.log("Requete : \"" + myQuery+"\"")
            console.log("Requete a la bdd : Ok")
            for (let i = 0; i < results.length; i++) {
                if(results[i].userName===user){
                    if(results[i].password===pass){
                        res.json({connexion:true})
                        return 0
                    }
                }
            }
            res.json({connexion:false})
        }else{
            console.log("Requete a la bdd : Failed")
            console.log("Requete : \"" + myQuery+"\"")
            console.log("Error displayed by the serv => " + error)
        }
    });
})

app.get("/checkUsers", cors(corsOptions),(req,res)=>{
    const {userName, emailAdress, phoneNumber} = req.query
    var showSql = "SELECT userName, emailAdress, phoneNumber FROM User"
    var error=null
    connection.query(showSql, function (err, result) {
        for (let i = 0; i < result.length; i++) {
            if(result[i].phoneNumber===phoneNumber){
                error="phoneNumber"
            }
            if(result[i].emailAdress===emailAdress){
                error="emailAdress"
            }
            if(result[i].userName===userName){
                console.log("++++++++++++++++++");
                error="userName"
            }
            console.log(userName + "/" + result[i].userName);
        }
        console.log("error = " + error);
        res.json({inputError:error})
    })
})

app.post("/users",cors(corsOptions),(req,res)=>{
    const {
        userName,
        firstName,
        secondName,
        emailAdress,
        password,
        phoneNumber,
        subscribe
    } = req.body
    console.log(req.body)
    var error=""
    var canAddInBdd = true
    var insertSql = "INSERT INTO User (userName, firstName, secondName, emailAdress, password, phoneNumber, subscribe) VALUES (\""+userName+"\",\""+firstName+"\",\""+secondName+"\",\""+emailAdress+"\",\""+password+"\",\""+phoneNumber+"\","+subscribe +")"
    console.log(insertSql)    
        connection.query(insertSql, function (err, result) {
            if (err) throw err;
            res.json({action:"done"})
        });
        console.log("post sur /users")
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
