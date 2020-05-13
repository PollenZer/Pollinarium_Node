const express = require("express")
const bodyParser = require('body-parser');
const cors = require("cors")
const CryptoJS = require("crypto-js")
const keyWord = "QueDeLaVie"
var mysql = require('mysql');

// je tiens juste a dire que emailAdress normalement il y a 2 "d" dans un bon anglais
// mais erreurs dinattention, il etais trop tard pour patch la faute

const app = express()
// ici on ecrit ces deux lignes car on veut pouvoir utiliser le body dans les requetes get
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

caEncodeOklm = mot => {
    return CryptoJS.DES.encrypt(mot, keyWord).toString()
}

caDesEncodeAussiOklmYaPasDeSouciLaDessusTktMemePas = mot => {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.DES.decrypt(mot, keyWord))
}

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}

// a modifier en fonction de l'hebergeur
/* NOTE localhost :
var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'user',
    password : 'root',
    database : 'pollen'
});
*/

// NOTE AlwaysData :  
var connection = mysql.createConnection({
    host     : 'mysql-pollenzer.alwaysdata.net',
    user     : 'pollenzer',
    password : 'StJoSeph!/56',
    database : 'pollenzer_pollen'
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

// clear console
// consoleLog le nom de la requete
initFunction = e => {
    console.log()
    console.log()
    console.log()
    console.log()
    console.log()
    console.log()
    console.log()
    console.log(e)
}

// en fait je fait mes consoleLog dans des fonctions
// psk cest tjr les memes et ya une certaines logique dans les output
bddRequest = () => {
    console.log("")
    console.log("+=============+")
    console.log("| BDD request |")
    console.log("+=============+")
    console.log("")
}

// quand la requete marche on met que ca marche et on print notre requete
requeteOk = e => {
    console.log("Requete : \"" + e +"\"")
    console.log("Requete a la bdd : Ok")
}

// quand la requete marche pas on met que ca marche
// on print notre requete
// puis lerreur display par node
requeteFailed = (myQuery, error) => {
    console.log("Requete a la bdd : Failed")
    console.log("Requete : \"" + myQuery+"\"")
    console.log("Error displayed by the serv => " + error)
}

// ici cest juste pour faire des test rapides pour voir si lapp est bien active
// btw on affiche tout les users inscrit
app.get("/",cors(corsOptions),(req,res)=>{
    initFunction("get sur /")
    var myQuery = "select * from User"
    bddRequest()
    connection.query(myQuery, function (error, results, fields) {
        if(error===null){
            requeteOk(myQuery)
            res.json({results})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

// input {userName, passWord}
// output connexion:{true | false}
app.get("/users",cors(corsOptions),(req,res)=>{
    initFunction("get sur /users")
    const {user, pass} = req.query
    console.log("input : ")
    console.log("user : " + user)
    console.log("pass : " + pass)
    var myQuery = "select userName,password from User"
    bddRequest()
    connection.query(myQuery, function (error, results) {
        if(error===null){
            requeteOk(myQuery)
            for (let i = 0; i < results.length; i++) {
                if(results[i].userName===user){
                    if(caDesEncodeAussiOklmYaPasDeSouciLaDessusTktMemePas(results[i].password)===pass){
                        res.json({connexion:true})
                        return 0
                    }
                }
            }
            res.json({connexion:false})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

// input username
// output all userData
app.get("/usersInfo",cors(corsOptions),(req,res)=>{
    initFunction("get sur /usersInfo")
    const user = req.query.user
    console.log("input : ")
    console.log("user : " + user)
    var myQuery = "select * from User"
    bddRequest()
    connection.query(myQuery, function (error, results) {
        if(error===null){
            requeteOk(myQuery)
            for (let i = 0; i < results.length; i++) {
                if(results[i].userName===user){
                    res.json(results[i])
                    return 0
                }
            }
            res.json({usersInfo:null})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

// input {userName, emailAdress, phoneNumber}
// output error:{phoneNumber | emailAdress | userName}
app.get("/checkUsers", cors(corsOptions),(req,res)=>{
    initFunction("get sur /checkUsers")
    var {userName, emailAdress, phoneNumber} = req.query
    console.log("input : ")
    console.log("userName : " + userName)
    console.log("emailAdress : " + emailAdress)
    console.log("phoneNumber : " + phoneNumber)
    var showSql = "SELECT userName, emailAdress, phoneNumber FROM User"
    var error=null
    bddRequest()
    connection.query(showSql, function (err, result) {
        if(err==null){
            requeteOk(showSql)
            for (let i = 0; i < result.length; i++) {
                if(result[i].phoneNumber===phoneNumber){
                    error="phoneNumber"
                }
                if(result[i].emailAdress===emailAdress){
                    error="emailAdress"
                }
                if(result[i].userName.toLowerCase()===userName.toLowerCase()){
                    error="userName"
                }
            }
            console.log("error = " + error);
            res.json({inputError:error})
        }else{
            requeteFailed(showSql, err)
        }
    })
})

// create user
// input {userName, firstName, secondName, emailAdress, phoneNumber, subscribe}
// output action:{done | null}
app.post("/users",cors(corsOptions),(req,res)=>{
    initFunction("post sur /users")
    const {
        userName,
        firstName,
        secondName,
        emailAdress,
        phoneNumber,
        subscribe
    } = req.body
    var password = req.body.password
    console.log("input : ")
    console.log("userName : "+userName)
    console.log("firstName : "+firstName)
    console.log("secondName : "+secondName)
    console.log("emailAdress : "+emailAdress)
    console.log("phoneNumber : "+phoneNumber)
    console.log("subscribe : "+subscribe)
    password = caEncodeOklm(password)
    var insertSql = "INSERT INTO User (userName, firstName, secondName, emailAdress, password, phoneNumber, subscribe) VALUES (\""+userName+"\",\""+firstName+"\",\""+secondName+"\",\""+emailAdress+"\",\""+password+"\",\""+phoneNumber+"\","+subscribe +")"
    bddRequest()
    connection.query(insertSql, function (err, result) {
        if (err===null){
            requeteOk(insertSql)
            res.json({action:"done"})
        }else{
            requeteFailed(insertSql, err)
        }
    });
})

// update userInfo
// input {userName, email, phoneNumber, subscribe, id} 
// output action:{done | null}
app.put("/editUser",cors(corsOptions),(req,res)=>{
    initFunction("put sur /editUser")
    const {
        email,
        phoneNumber,
        subscribe,
        id
    } = req.body
    console.log("input : ")
    console.log("email : "+email)
    console.log("phoneNumber : "+phoneNumber)
    console.log("subscribe : "+subscribe)
    console.log("id : "+id)
    var updateSql = "UPDATE User SET emailAdress = \'"+email+"\',phoneNumber = \'"+phoneNumber+"\',subscribe = \'"+subscribe+"\' WHERE ID_user = "+id
    bddRequest()
    connection.query(updateSql, function (err, result) {
        if (err===null){
            requeteOk(updateSql)
            res.json({action:"done"})
        }else{
            requeteFailed(updateSql, err)
        }
    });
})

// get data from infoPollen table
app.get("/infoPollen",cors(corsOptions),(req,res)=>{
    initFunction("get sur /infoPollen")
    var myQuery = "SELECT id_InfoPollen,namePollen FROM InfoPollen"
    bddRequest()
    connection.query(myQuery, function (err, result) {
        if (err===null){
            requeteOk(myQuery)
            res.json(result)
        }else{
            requeteFailed(myQuery, err)
        }
    });
})

// get data from pollen table
// input ID_user
app.get("/pollen",cors(corsOptions),(req,res)=>{
    initFunction("get sur /pollen")
    var ID_user = req.query.ID_user
    console.log("input : ")
    console.log("ID_user : "+ID_user)
    var myQuery = "SELECT FK_infoPollen,FK_user FROM Pollen WHERE FK_user = " + ID_user
    bddRequest()
    connection.query(myQuery, function (err, result) {
        if (err===null){
            requeteOk(myQuery)
            res.json(result)
        }else{
            requeteFailed(myQuery, err)
        }
    });
})

app.delete("/infoPollen",cors(corsOptions), (req, res) =>{
    initFunction("delete sur /infoPollen")
    const idUser = req.body.idUser
    console.log("input : ")
    console.log("idUser : "+idUser)
    var myQuery = "DELETE FROM Pollen WHERE FK_user = " + idUser
    bddRequest()
    connection.query(myQuery, function (error, results) {
        if(error===null){
            requeteOk(myQuery)
            res.json({action:"done"})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

// btw on affiche tout les users inscrit
app.put("/editPollenData",cors(corsOptions), (req, res) =>{
    const {data, idUser} = req.body
    console.log("input : ")
    console.log("data : "+data)
    console.log("idUser : "+idUser)
    initFunction("put sur /editPollenData")
    // ici on construit notre requete
    // ca doit ressembler a ca (trouver sur stackoverflowzer)
//     INSERT INTO MyTable
//   ( Column1, Column2, Column3 )
//     VALUES
//   ('John', 123, 'Lloyds Office'), 
//   ('Jane', 124, 'Lloyds Office'), 
//   ('Billy', 125, 'London Office'),
//   ('Miranda', 126, 'Bristol Office');
    var myQuery = "INSERT INTO Pollen (FK_infoPollen, FK_user) VALUES "
    for (let i = 0; i < data.length; i++) {
        myQuery+="("+data[i]+","+idUser+"),"
    }
    myQuery = myQuery.slice(0, -1)
    myQuery+=";"
    bddRequest()
    connection.query(myQuery, function (error, results) {
        if(error===null){
            requeteOk(myQuery)
            res.json({action:"done"})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

app.delete("/user",cors(corsOptions), (req, res) =>{
    initFunction("delete sur /user")
    const idUser = req.body.idUser
    console.log("input : ")
    console.log("idUser : "+idUser)
    var myQuery = "DELETE FROM User WHERE ID_user = " + idUser
    bddRequest()
    connection.query(myQuery, function (error, results) {
        if(error===null){
            requeteOk(myQuery)
            res.json({action:"done"})
        }else{
            requeteFailed(myQuery, error)
        }
    });
})

// get curent pollen in the air
// input currentMonth
app.get("/currentPollen",cors(corsOptions),(req,res)=>{
    initFunction("get sur /currentPollen")
    var currentMonth = req.query.currentMonth
    console.log("input : ")
    console.log("currentMonth : "+currentMonth)
    // je fait ca ainsi si le numero du mois cest 1 on tombera pas sur le mois numero 10
    // ca ca marche que si la disposition de la bdd est adequate
    currentMonth==1?currentMonth="1/":null
    if(currentMonth==0){
        var myQuery = "SELECT * FROM InfoPollen WHERE date LIKE '" + currentMonth + "%'"
    }else{
        var myQuery = "SELECT * FROM InfoPollen WHERE date LIKE '%" + currentMonth + "%'"
    }
    bddRequest()
    connection.query(myQuery, function (err, result) {
        if (err===null){
            requeteOk(myQuery)
            res.json(result)
        }else{
            requeteFailed(myQuery, err)
        }
    });
})

// 404 error
app.use(cors(corsOptions),function(req, res, next){
    console.log("")
    console.log()
    console.log()
    console.log()
    console.log()
    console.log()
    console.log("+====================+")
    console.log("| 404 page not found |")
    console.log("+====================+")
    console.log("")
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
