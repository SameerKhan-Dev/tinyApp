
const express = require("express");

const app = express();

const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// this object represents our database for now 
// this urlDatabase object will be used to keep track of all the URLS and their shortened forms
// this is the data that we want to show on the URLS page.
// therefore we need to pass along the urlDatabase to the template.

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",

  "9sm5xK": "http://www.google.com"

} 

// ROUTING WITH SPECIFIC PATHS
// .get is a built in function that we calling here and supplying the callback function (req,res) to it.
app.get("/", (req,res) => {

  res.send("Hello!");

});
/*
  The app. get() method specifies a callback function that will be invoked whenever there is an HTTP GET request
  with a path ( '/' ) relative to the site root. The callback function takes a
  request and a response object as arguments, and simply calls send() on the response

*/
app.get("/urls.json", (req,res) => {

  // format the response to be in JSON format using syntax below
  // res.json, also calls res.send btw.
  res.json(ur/lDatabase);

});

app.get("/urls", (req, res) => {
  
  // res.render() takes two parameters. 
  // Param 1) is the ejs template file name (without the ejs extension) corresponding to the specific URL inside the views folder, 
  // Param 2) is the object representing the data we want to be accessible in our ejs template file. i.e..
  // i.e the keys inside the param 2 object are accessible inside the ejs file as variables.

  /*  
    When sending variables to an EJS template, we need to send them inside an object, 
    even if we are only sending one variable. This is so we can use the key of that variable 
    (in the above case the key is urls) to access the data within our template.
  */
  const templateVars = {urls: urlDatabase}
 // console.log(templateVars.urls.b2xVn2);

  res.render('urls_index', templateVars);

});

app.get("/hello", (req, res) => {
  // when sending html it creates the browser creates the corresponding html rendering for us on the screen
  res.send("<html><body>Hello <b>World</</body></html>\n");
});

// any page in the urls page
app.get("/urls/:shortURL", (req, res) => {

  
  const templateVars = { 
    // over here the variable shortURL will be visible inside the HTML file
    shortURL: req.params.shortURL,
    // over here the variable longURL will be visible inside the HTML file
    // accessing the actual longURL
    longURL : urlDatabase[req.params.shortURL] 
  };
  console.log(templateVars.longURL);

  // render the ejs template file into a html file
  res.render("urls_show", templateVars);
});


// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

