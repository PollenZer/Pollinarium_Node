#!/bin/bash
URLServ=http://localhost:8000/
pauseTimer=0
# jpense on va faire un output dans le terminal et un output dans un fichier
# genre test.log

echo 
echo "++=====================++"
echo "||                     ||"
echo "||    Test de l'API    ||"
echo "||                     ||"
echo "++=====================++"
echo 
echo 

# test create user post sur /users
createUser=$(curl -s -d '{"userName":"root","firstName":"root","secondName":"root","emailAdress":"root@root.fr","password":"root","phoneNumber":"060606060606","subscribe":1}' -H "Content-Type: application/json" -X POST "${URLServ}users")
echo "creation d'un utilisateur user=root/pass=root :"
echo "expected output  : {\"action\":\"done\"}"
sleep $pauseTimer
echo "effective output : "$createUser
echo
sleep $pauseTimer

# ensuite on essaie de verifier si le jeu user/pass est bon selon le serv
testGoodConnexion=$(curl -s "${URLServ}users?user=root&pass=root")
echo "test de BONNE connexion user/pass : "
echo "expected output  : {\"connexion\":true}"
sleep $pauseTimer
echo "effective output : "$testGoodConnexion
echo
sleep $pauseTimer

# ensuite fake input
testBadConnexion=$(curl -s "${URLServ}users?user=siTuCreeCeUserSacheQueTesPasDrol&pass=ploplpoplo")
echo "test de MAUVAISE connexion user/pass  : "
echo "expected output  : {\"connexion\":false}"
sleep $pauseTimer
echo "effective output : "$testBadConnexion
echo
sleep $pauseTimer

# ensuite get user data
getUserData=$(curl -s "${URLServ}usersInfo?user=root")
echo "recuperation de notre user : "
echo "expected output  : {infosDeLutilisateurFormatJson}"
sleep $pauseTimer
echo "effective output : " $(jq . <<< $getUserData)
echo
sleep $pauseTimer

# ca pue ici genre cest pas incroyable
# bon ici je fixe le delimiter pour couper mon string a :
IFS=":"
# du ocup la mon json il est coupe en plein de mot avec : comme delimiter
read -ra wordInJson <<< "$getUserData"
# la je prend comme mot a redecouper le deuxieme : 16,"userName"
tmpWord=${wordInJson[1]}
# la on voit que apres la , osef du coup on set le delimiter a la virgule
IFS=","
# n met le nouveau wordInJson a jour
read -ra wordInJson <<< "$tmpWord"
# et du coup on a notre Id hihi
userId=${wordInJson[0]}


# ici jai mis aucun test mais si on veux on peux modifier les parametres
checkDataPresence=$(curl -s "${URLServ}checkUsers?userName={nomDeTest}&emailAdress={mailDeTest}&phoneNumber={telDeTest}")
echo "check data presence same email : "
echo "expected output  : {\"inputError\":null}"
sleep $pauseTimer
echo "effective output : "$checkDataPresence
echo
sleep $pauseTimer

# ici je modifie un utilisateur le seul truc a pas oublier cest denvoyer le bon userId
# cest dailleurs pour ca que je dois mettre mon payload dans une variable a part
# sinon ca fout la merde quand jinsere ma variable userId
contentData="{\"email\":\"root@root.com\",\"phoneNumber\":\"06060606060\",\"subscribe\":0,\"id\":${userId}}"
editUser=$(curl -sd "${contentData}" -H "Content-Type: application/json" -X PUT "${URLServ}editUser")
echo "edit user : "
echo "expected output  : {\"action\":\"done\"}"
sleep $pauseTimer
echo "effective output : "$editUser
echo
sleep $pauseTimer

# recuperation des donnes de la table info pollen 
infoPollen=$(curl -s "http://localhost:8000/infoPollen")
echo "recuperation des donnes de la table info pollen : "
echo "expected output  : {donnees sur le pollen format json}"
sleep $pauseTimer
echo "effective output : " $(jq . <<< $infoPollen)
echo
sleep $pauseTimer

# creer des liaisons entre infoPollen et user
contentData="{\"data\":[1,3,12,16,5],\"idUser\":${userId}}"
createPollenLinks=$(curl -sd "${contentData}" -H "Content-Type: application/json" -X PUT "${URLServ}editPollenData")
echo "on cree des liens entre infoPollen et User : "
echo "expected output  : {\"action\":\"done\"}"
sleep $pauseTimer
echo "effective output : " $createPollenLinks
echo
sleep $pauseTimer

# on check si on voit bien nos nouvelles liaisons
getLinkUserPollen=$(curl -s "http://localhost:8000/pollen?ID_user=${userId}")
echo "on get les nouvelles liaisons creee: "
echo "expected output  : {liaisons format Json}"
sleep $pauseTimer
echo "effective output : " $(jq . <<< $getLinkUserPollen)
echo
sleep $pauseTimer

# suppression des liaisons entre infoPollen et user
contentData="{\"idUser\":${userId}}"
deletePollenLinks=$(curl -sd "${contentData}" -H "Content-Type: application/json" -X DELETE "${URLServ}infoPollen")
echo "on supprime les liens entre infoPollen et User : "
echo "expected output  : {\"action\":\"done\"}"
sleep $pauseTimer
echo "effective output : " $deletePollenLinks
echo
sleep $pauseTimer

# suppression de l'user
contentData="{\"idUser\":${userId}}"
deleteUser=$(curl -sd "${contentData}" -H "Content-Type: application/json" -X DELETE "${URLServ}user")
echo "on supprime notre User : "
echo "expected output  : {\"action\":\"done\"}"
sleep $pauseTimer
echo "effective output : " $deleteUser
echo
sleep $pauseTimer


# faire une verification automatique genre verifier si les 
# expected output  
# effective output 
# sont bien egaux