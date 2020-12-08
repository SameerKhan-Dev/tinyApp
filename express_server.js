
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

app.get("/urls.json", (req,res) => {

  // format the response to be in JSON format using syntax below
  // res.json, also calls res.send btw.
  res.json(ur/lDatabase);

});

app.get("/hello", (req, res) => {
  // when sending html it creates the browser creates the corresponding html rendering for us on the screen
  res.send("<html><body>Hello <b>World</</body></html>\n");
});

// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

