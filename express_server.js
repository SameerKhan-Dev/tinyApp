// this object represents our database for now
// this urlDatabase object will be used to keep track of all the URLS and their shortened forms
// this is the data that we want to show on the URLS page.
// therefore we need to pass along the urlDatabase to the template.

const urlDatabase = {

  "b2xVn2": "http://www.lighthouselabs.ca",

  "9sm5xK": "http://www.google.com"

};
// database of users intialize it to be empty
const users = {

};
/*
  This function simulates generating a "unique" shortURL, we will implement
  a function that returns a string of 6 random alphanumeric characters.
*/
const generateRandomString = function (stringLength) {
  // need to randomly generate characters and string them together
  let shortURL = "";
  // list of all acceptables characters
  let alphaNumericCharacters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // generate six random characters and create shortURL
  for (let x = 0; x < stringLength; x++) {
    
    // generate random value representing the index inside alphaNumericCharacters
    let randomIndex = Math.floor(Math.random() * (alphaNumericCharacters.length - 1));
    
    // use the random index to obtain the character and append it to the shortURL string
    shortURL += alphaNumericCharacters[randomIndex];
    
  }
  return shortURL;
}

// this function checks to see if the email submitted in registration form is valid or not
// email is not valid if the email already exists and/or the email string is undefined or empty
// if valid email, return true, else return false
const emailChecker = function(email) {
  let validEmail = true;
  if (email === "") {
    validEmail = false;
  }
  for (let userId in users) {
    if (users[userId].email === email) {
      validEmail = false;
    }
  }
  return validEmail;
};
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
//const ejsLint = require('ejs-lint');
let cookieParser = require('cookie-parser');
app.use(cookieParser());
//const uuid = require('uuid/v8.3.2');
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");



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

  const user_id = req.cookies["user_id"];
  // render the urls_new page on the browser as a response. Form is provided to user.
  let templateVars = {};
  // if the user id exists then we send the actual user object to the ejs template
  // else we send undefined
  if (user_id) {
    templateVars = {
      user: users[user_id]
    };

  } else {

    templateVars = {
      user: undefined
    };
  }
  console.log("templateVars inside get --> /urls/new is", templateVars);
  // templateVars is the object itself -- inside it the object: user_id has keys id:, email:, password.
  // inside ejs file can directly access id, email, password;
  res.render('urls_new', templateVars);
  
});

// receive a request to go to upload login page for rendering
app.get("/login", (req, res) => {
  const templateVars = {
    // access the username if it exists as a cookie
    user: undefined //users[req.cookies["user_id"]]
  };
  res.clearCookie("user_id");
  // render the login page
  res.render('urls_loginPage.ejs',templateVars);

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
  const shortURL = generateRandomString(6);
  // add the new key-value pair to the urlDatabase object
  urlDatabase[shortURL] = newLongURL;
  // redirect to
  //add status code 302
  res.status(302);
  res.redirect(`/urls/${shortURL}`);

  
});

// Post route that removes a URL resource
app.post("/urls/:shortURL/delete", (req , res) => {

  // use Javascript's delete operator that removes a property from an object
  const shortURLID = req.params.shortURL;

  // delete URL resource from database
  delete urlDatabase[shortURLID];

  res.redirect("/urls");
  /*
  console.log("shortURLID deleted:", shortURLID);
  console.log("Resulting URL Database is: ", urlDatabase);
  */
});

app.post("/urls/:shortURL", (req, res) => {

  //get the short URL from the request body
  const shortURL = req.params.shortURL;

  //get the new long URL from the request body
  const newLongURL = req.body.newURL;

  // update database long URL
  urlDatabase[shortURL] = newLongURL;
  //console.log("newLongURL is: " , newLongURL);
  //console.log("shortURL is ", shortURL);
  // redirect to the url show page to display the updated url info
  res.redirect(`/urls/${shortURL}`);
});

// Route for Login
app.post("/login", (req, res) => {

  // access the req.body.username to get the value from the form and set it inside a cookie

  const email = req.body.email;
  let userExists = false;
  // set cookie res.cookes.cookie("user_id", newUser.id);
 
  for (let user in users) {
    // user is same as user.id because its the literal string value
    // check if user already exists in the database, and get the value of it userID
    if (users[user].email === email) {
      res.cookie('user_id', user);
      userExists = true;
      break;
    }
  }
  if (userExists) {
    // redirect back to the /urls page
    res.redirect('/urls');
  } else {
    res.redirect('/register');
  }
 

});

// Route for logout and to clear cookies

app.post("/logout", (req,res) => {

  // clear the cookies and redirect to the urls page
  res.clearCookie("user_id");

 
  // redirect to the main urls page
  res.redirect('/urls');

});

// New user registration post request
app.post("/register", (req, res) => {

  // check if email is valid if its not send a 404 status code error
  let isValidEmail = emailChecker(req.body.email);
  if (isValidEmail === false) {
    console.log("users Object now is",users);
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Email is already in use or an empty email address was submitted</h1>");
  } else if (req.body.password === "") {
    console.log("users Object now is",users);
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Password can not be empty, must be filled out.</h1>");
  } else {
    const userId = generateRandomString(8);
  
    // create object to store user's email and password values using the req.body values for input from ejs template
    const userEmail = req.body.email;
    const userPw = req.body.password;
    const newUser = {
      id: userId,
      email: userEmail,
      password: userPw
    };
    // add new user object to the global users object
    users[userId] = newUser;
   
    // test print users
    console.log(users);
  
    // after adding the user, set a user_id cookie containing the user's newly generated ID
    res.cookie("user_id", newUser.id);
    
    // redirect to the /urls page
    res.redirect("/urls");
  }

});

// Get registration page
app.get("/register", (req, res) => {

  //render the corresponding registration ejs template : urls_registration

  const templateVars = {
    // access the username if it exists as a cookie
    user: undefined //users[req.cookies["user_id"]]
  };
  
  res.render("urls_registration", templateVars);
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
  const userId = req.cookies['user_id'];
  //const usernameValue = req.cookies;
  let templateVars = {};
  console.log("req.cookies are:", req.cookies);
  if (userId) {
    templateVars = {

      urls: urlDatabase,
      user: users[userId]
    };

  } else {
    templateVars = {
      urls: urlDatabase,
      user: undefined //users[userId]
    };
  }
 
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

  let user_id = req.cookies["user_id"];
  let userObject;
  if (user_id) {
    userObject = users[user_id];
  } else {
    userObject = undefined;
  }
  
  const templateVars = {
    // over here the variable shortURL will be visible inside the HTML file
    shortURL: req.params.shortURL,
    // over here the variable longURL will be visible inside the HTML file
    // accessing the actual longURL
    longURL : urlDatabase[req.params.shortURL],
    // access the username if it exists as a cookie
    user: userObject // users[req.cookies["user_id"]]
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

