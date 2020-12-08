
const express = require("express");

const app = express();

const PORT = 8080; // default port 8080

// this object represents our database for now
const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",

  "9sm5xK": "http://www.google.com"

} 

// ROUTING WITH SPECIFIC PATHS
// .get is a built in function that we calling here and supplying the callback function (req,res) to it.
app.get("/", (req,res) => {

  res.send("Hello!");

});

// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

