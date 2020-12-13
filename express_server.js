
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
//const ejsLint = require('ejs-lint');
//let cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
//app.use(cookieParser());
const getUserByEmail = require('./helpers');
app.use(cookieSession({
  name: 'session',
  keys: ['b6d0e7eb-8c4b-4ae4-8460-fd3a08733dcb', '1fb2d767-ffbf-41a6-98dd-86ac2da9392e']
}))

//const uuid = require('uuid/v8.3.2');
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


// this object represents our database for now
// this urlDatabase object will be used to keep track of all the URLS and their shortened forms
// this is the data that we want to show on the URLS page.
// therefore we need to pass along the urlDatabase to the template.

const urlDatabase = {

  //"b2xVn2": "http://www.lighthouselabs.ca",

  //"9sm5xK": "http://www.google.com"

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
const emailChecker = function(email, usersObject) {
  let validEmail = true;
  if (email === "") {
      validEmail = false;
      return validEmail;
  }
  
  let foundObject = getUserByEmail(email , usersObject);
  //console.log("foundObject is ", foundObject);
  if (typeof foundObject === "undefined"){
    validEmail = true;
  } else {
    validEmail = false;
  }
  return validEmail;
};




// This function returns all the urls where the userID is equal to the id of the currently logged-in user in an object format
// resultsObj = { shortURL1: longURL1, shortURL2 : longURL2 .....} 
const urlsForUser = function (id) {
  let resultsObj = {};
  console.log("id is: ",id);
  for (let url in urlDatabase){
    console.log("urlDatabase is :", urlDatabase);
    if(urlDatabase[url]["userID"] === id){
      
      resultsObj[url]= urlDatabase[url];
      
    }
  }
  return resultsObj;
};

// This function checks if given logged in-user with user_id created the URL that they are trying to access
const urlChecker = function (user_id, shortURL) {
  // obtain the urls that belong to the user
  let userURLS = urlsForUser(user_id);

  // iterate through the userUrls object to see if there is a match with the shortURL.
  for (let key in userURLS){

    if(key === shortURL) {
      // shortURL matches, so measn the inputted shortURL does belong to the current logged-in user.
      return true;

    }
  }
  // key match not found, so return false, meaning the inputted shortURL does not belong to the logged-in user
  return false;
}

// this function checks if a given shortURL exists in the url database, if it doesn't exist, an error message is presented.
const checkUrlExists = function (shortURL, urlDatabase) {
  
  // iterate through the urlDatabase to check if the short URL is valid / exists. Key is the shortURL keys.
  for (let key in urlDatabase){

    // check if key matches shortURL, return true if a match is found
    if(key === shortURL){
      return true;
    }
    
  }
  // shortURL not found, so return false;
  return false;
};

// ROUTING WITH SPECIFIC PATHSewLongURL = req.body.longURL;
// .get is a built in function that we calling here and supplying the callback function (req,res) to it.
app.get("/", (req,res) => {

  const user_id = req.session.user_id;

  if (user_id) {
    res.redirect("/urls");

  } else {

    res.redirect("/login");
  }

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

// provide form to shorten a new url
app.get("/urls/new", (req, res) => {

  //const user_id = req.cookies["user_id"];
  const user_id = req.session.user_id;
  // render the urls_new page on the browser as a response. Form is provided to user.
  let templateVars = {};
  // if the user id exists then we send the actual user object to the ejs template
  // else we send undefined
  if (user_id) {
    templateVars = {
      user: users[user_id]
    };
    // templateVars is the object itself -- inside it the object: user_id has keys id:, email:, password.
  // inside ejs file can directly access id, email, password;
  //console.log("you have access because you are logged in!");
  res.render('urls_new', templateVars);

  } else {

    templateVars = {
      user: undefined
    };
    // redirect to login page
    //console.log("you do not have access because you are not logged in, please login");
    //res.render('urls_loginPage', templateVars);
    res.redirect("/login");
  }
  //console.log("templateVars inside get --> /urls/new is", templateVars);
 
  
});

// receive a request to go to upload login page for rendering
app.get("/login", (req, res) => {
  const user_id = req.session.user_id;
  // check if user is logged in, if logged in the redirect to /urls page
  if(user_id) {
    // redirect to /urls page
    res.redirect("/urls");
  } else {
    const templateVars = {
      // access the username if it exists as a cookie
      user: undefined //users[req.cookies["user_id"]]
    };
    //res.clearCookie("user_id");
    // render the login page
    res.render('urls_loginPage.ejs',templateVars);
  }
});

// receive a post request and access the data to post
app.post('/urls', (req, res) => {

  // body-parser formats the buffer (input data from form in post request) into a Javascript object
  // where longURL is the key; we specified this key using the input attribute name.
  // The value is the content from the input field.
  // console.log(req.body);
  //res.send("Ok");
  // access the request body which contains the input data as per ejs file template

  //const userID = req.cookies['user_id'];
  const userID = req.session.user_id;

  // check if user_id cookie session exists (i.e if user is logged in or not), if not logged in, send html error message
  if (!userID){
    res.send("<h1>Error! User not logged in. Please login to create a new url!</h1>");

  } else {

    const newLongURL = req.body.longURL;
    const shortURL = generateRandomString(6);
    // add the new key-value pair to the urlDatabase object
    urlDatabase[shortURL] = { longURL: newLongURL, userID: userID};
    // redirect to
    //add status code 302
    //console.log("Urls database now looks like: ", urlDatabase);
    res.status(302);
    res.redirect(`/urls/${shortURL}`);

  }
});

// Post route that removes a URL resource
app.post("/urls/:shortURL/delete", (req , res) => {

  //let userId = req.cookies["user_id"];
  let userId = req.session.user_id;
  // use Javascript's delete operator that removes a property from an object
  const shortURLID = req.params.shortURL;
  
  // delete URL resource from database
  // first check if user is logged in else send an error message
  if(userId){
    // console.log("deleted fam!");
    // check if url belongs to user_id
    let urlBelongs = urlChecker(userId, shortURLID);
      if(urlBelongs === false) {
        res.send("<h1>Error! Sorry you can not delete this URL as you are not the creator/owner of this link");
      } else {

        delete urlDatabase[shortURLID];
        res.redirect("/urls");
      }
    
  } else {
    // send error message because user is not logged in
    res.send("<h1>Error! To delete a url you must be logged in and must own the url</h1>");
  }
  /*
 
  console.log("shortURLID deleted:", shortURLID);
  console.log("Resulting URL Database is: ", urlDatabase);
  */
  
});

app.post("/urls/:shortURL", (req, res) => {

  //get the short URL from the request body
  const shortURL = req.params.shortURL;
  //let userID = req.cookies["user_id"];
  let userID = req.session.user_id;
  //get the new long URL from the request body
  const newLongURL = req.body.newURL;

  // check if user is owns the url for the given userID

  
    // check if userID is logged in 
    if(userID) {

        // check if the shortURL belongs to the existing logged in user
      let urlBelongs = urlChecker(userID, shortURL);
      if(urlBelongs === false) {
        res.send("<h1>Error! Sorry you do not have access to this URL page on this app, as you are not the creator/owner of this link");
      } else {
      
        for(let shortURLKey in urlDatabase){
          if(shortURLKey === shortURL){
            urlDatabase[shortURLKey]["longURL"] = newLongURL;
      
          }
        }
        // redirect to urls page
        res.redirect('/urls');
      } 
    }
    // update database long URL
    //urlDatabase[shortURL] = newLongURL;
    //console.log("newLongURL is: " , newLongURL);
    //console.log("shortURL is ", shortURL);
    // redirect to the url show page to display the updated url info
    //res.redirect(`/urls/${shortURL}`);

    else {
      // user is not logged in so send error message
    res.send("Error! User not logged in so can not make changes to update URL!");
    }
});

// Route for Login
app.post("/login", (req, res) => {

    // access the req.body.username to get the value from the form and set it inside a cookie
  // check if email is valid if its not send a 404 status code error
  let isValidEmail = emailChecker(req.body.email, users);

  const email = req.body.email;
  const password = req.body.password;
  const userObject = getUserByEmail(email , users);
  
    // if email is an empty string 
    if (email === ""){
      res.status(403).send("<h1>Status Error Code: 403 . Empty email address was submitted</h1>");
    } else if (typeof userObject === "undefined"){
      // if email was not found userObject would be type undefined as returned by the emailFinder function
      res.status(403).send("<h1>Status Error Code: 403 . Email Address is not found!</h1>");
    } else {
      // email is valid and now need to check if passwords match (i.e what was entered vs. what was inside the database).

      if(bcrypt.compareSync(password, userObject.password)){
        // password is valid, and both conditions (email + password have been met). 
        // set the cookie to be user_id
        console.log(`${userObject.id} is the userObject.id`);
        //res.cookie('user_id', userObject.id);
        req.session["user_id"] = userObject.id;
        // redirect to urls page
       
        res.redirect('/urls');
      } else {
        // passwords do not match send a 403 error
        res.status(403).send("<h1>Status Error Code: 403. Passwords do not match!</h1>");

      }
      
      
    }

});

// Route for logout and to clear cookies

app.post("/logout", (req,res) => {

  // clear the cookies and redirect to the urls page
  //res.clearCookie("user_id");

  req.session = null;
  // redirect to the main urls page
  res.redirect('/urls');

});

// New user registration post request
app.post("/register", (req, res) => {
  console.log(users);
  // check if email is valid if its not send a 404 status code error
  let isValidEmail = emailChecker(req.body.email, users);
  if (isValidEmail === false){ 
    console.log("users Object now is",users);
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Email is already in use or an empty email address was submitted</h1>");
  } else if (req.body.password === "") {
    console.log("users Object now is",users);
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Password can not be empty, must be filled out.</h1>");
  } else {
    console.log("submitted password is: ", req.body.password);
    const userId = generateRandomString(8);
    // hash the password and store it
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    // create object to store user's email and password values using the req.body values for input from ejs template
    const userEmail = req.body.email ;
    //const userPw = req.body.password;
    const newUser = {
      id: userId,
      email: userEmail,
      password: hashedPassword
    };
    console.log("hashedPassword is: ", newUser.password);
    // add new user object to the global users object
    users[userId] = newUser;
   
    // test print users
    console.log(users);
  
    // after adding the user, set a user_id cookie containing the user's newly generated ID
    //res.cookie("user_id", newUser.id);
    req.session["user_id"] = newUser.id;
    // redirect to the /urls page
    res.redirect("/urls");
  }
  console.log("the user database now looks like with the hashed password stored: ", users);
});

// Get registration page
app.get("/register", (req, res) => {

  //render the corresponding registration ejs template : urls_registration
  let userID = req.session.user_id;
  // check if user is logged in, and if logged in then redirect to /urls page. if not logged in, render login page
  if(userID) {

    res.redirect('/urls');

  } else {
    
    const templateVars = {
      // access the username if it exists as a cookie
      user: undefined //users[req.cookies["user_id"]]
    };
    // user not logged so render login page
    res.render("urls_registration", templateVars);
  }
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
  const userId = req.session.user_id;
  //const usernameValue = req.cookies;
  let templateVars = {};
  
 // console.log("req.cookies are:", req.cookies);
  if (userId) {
    let urlsObject = urlsForUser(userId);
    templateVars = {

      urls: urlsObject,
      user: users[userId]
    };
    res.render('urls_index', templateVars);
  } else {
    
    templateVars = {
      urls: undefined,
      user: undefined //users[userId]
    };
    res.render('urls_index', templateVars);
    
  }
 
  // console.log(templateVars.urls.b2xVn2);
});


// redirecting short URLS to long URL versions
app.get("/u/:shortURL", (req, res) => {

  // extract shortURL from req.params
  const shortURLID = req.params.shortURL;
  // check if shortURL exists inside the urls database, if it does not then return error html message
  let urlExists = checkUrlExists(shortURLID, urlDatabase);
  if (urlExists === false){

    res.send("<h1>Error! URL does not exist inside database!");
    
  }
  // check
  //console.log(urlDatabase);
   // using the shortURL in the request, extract the longURL from the urlsDatabase object
  const longURL = urlDatabase[shortURLID]["longURL"];
  // redirect using longURL
  res.redirect(longURL);
});

// any page in the urls page
app.get("/urls/:shortURL", (req, res) => {
  //console.log("inside app.get urls/:shortURL....");

  let user_id = req.session.user_id;
  // if user_id is not set return error.
  if(!user_id) {
    res.send("<h1>Error: not logged in!</h1>");
  }
  // store the short url from the parameters in the request
  let shortURL = req.params.shortURL;

  // check if shortURL is valid, i.e exists inside the urlDatabase
  let urlIsValid = checkUrlExists( shortURL, urlDatabase);
  if (!urlIsValid) {

    res.send("<h1>Error! Invalid short url! Does not exist in database!</h1>");
  } else {


    // check if the shortURL belongs to the existing logged in user
    let urlBelongs = urlChecker(user_id, shortURL);
    if(urlBelongs === false) {
      res.send("<h1>Error! Sorry you do not have access to this URL page on this app, as you are not the creator/owner of this link");
    }

    let userObject;
    if (user_id) {
      userObject = users[user_id];
    } else {
      userObject = undefined;
    }
    
    const templateVars = {
      // over here the variable shortURL will be visible inside the HTML file
      shortURL: shortURL,
      // over here the variable longURL will be visible inside the HTML file
      // accessing the actual longURL
      longURL : urlDatabase[req.params.shortURL]["longURL"],
      // access the username if it exists as a cookie
      user: userObject // users[req.cookies["user_id"]]
    };
    //console.log("urlDatabase is: ", urlDatabase);
    //console.log("req.params.shortURL is:", req.params.shortURL);
    //console.log("templateVars is:", templateVars);
    //console.log(templateVars.longURL);

    // render the ejs template file into a html file
    if(user_id){

      res.render("urls_show", templateVars);

    } 
  }
});


// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  
  console.log(`Example app listening on port ${PORT}!`);

});

