/*
  This function simulates generating a "unique" shortURL, we will implement
  a function that returns a string of 6 random alphanumeric characters.
*/
function generateRandomString() {
  // need to randomly generate 6 characters and string them together
  let shortURL = "";
  // list of all acceptables characters
  let alphaNumericCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // generate six random characters and create shortURL
  for(let x = 0; x < 6 ; x++) {  
    
    // generate random value representing the index inside alphaNumericCharacters
    let randomIndex= Math.floor(Math.random()*(alphaNumericCharacters.length-1));
    
    // use the random index to obtain the character and append it to the shortURL string
    shortURL += alphaNumericCharacters[randomIndex];
    
  }
  return shortURL;
}

const express = require("express");

const app = express();

const bodyParser = require("body-parser");

const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// this object represents our database for now 
// this urlDatabase object will be used to keep track of all the URLS and their shortened forms
// this is the data that we want to show on the URLS page.
// therefore we need to pass along the urlDatabase to the template.

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",

  "9sm5xK": "http://www.google.com"

} 

// ROUTING WITH SPECIFIC PATHSewLongURL = req.body.longURL;
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
  res.json(urlDatabase);

});


app.get("/urls/new", (req, res) => {

  // render the urls_new page on the browser as a response. Form is provided to user.
  res.render('urls_new'); 

});

// receive a post request and access the data to post
app.post('/urls', (req, res) => {

  // body-parser formats the buffer (input data from form in post request) into a Javascript object
  // where longURL is the key; we specified this key using the input attribute name. 
  // The value is the content from the input field.
  // console.log(req.body);
  //res.send("Ok");
  // access the request body which contains the input data as per ejs file template
  const newLongURL = req.body.longURL;
  const shortURL = generateRandomString();
  // add the new key-value pair to the urlDatabase object
  urlDatabase[shortURL] = newLongURL;
  // redirect to
  //add status code 302
  res.status(302); 
  res.redirect(`/urls/${shortURL}`);

  
});

app.get("/urls", (req, res) => {
  
  // res.render() takes two ,parameters. 
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
// redirecting short URLS to long URL versions
app.get("/u/:shortURL", (req, res) => {
  // 
  // using the shortURL in the request, extract the longURL from the urlsDatabase object
  const shortURLID = req.params.shortURL;
  const longURL = urlDatabase[shortURLID];
  // redirect using longURL
  res.redirect(longURL);
});
// any page in the urls page
app.get("/urls/:shortURL", (req, res) => {
  //console.log("inside app.get urls/:shortURL....");
  const templateVars = { 
    // over here the variable shortURL will be visible inside the HTML file
    shortURL: req.params.shortURL,
    // over here the variable longURL will be visible inside the HTML file
    // accessing the actual longURL
    longURL : urlDatabase[req.params.shortURL] 
  };
  //console.log("urlDatabase is: ", urlDatabase);
  //console.log("req.params.shortURL is:", req.params.shortURL);
  //console.log("templateVars is:", templateVars);
  //console.log(templateVars.longURL);

  // render the ejs template file into a html file
  res.render("urls_show", templateVars);
});


// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

