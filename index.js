import dotenv from "dotenv"


dotenv.config({
    path : "./env"
});

let myusername = process.env.database

console.log("Value: ",myusername)

console.log("Start of backend project");

