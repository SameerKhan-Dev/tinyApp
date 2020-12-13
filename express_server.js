/* ---------------------- NODE MODULES AND CONSTANTS DEFINED ---------------------------------------------------------------- */

// declare all node modules or tools required in this file

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
}));

// set port to default port 8080
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");



/* ---------------------- DATABASE OBJECTS DEFINED --------------------------------------------------------------------------- */

/*
  - this object represents our database for now
  - this urlDatabase object will be used to keep track of all the URLS and their shortened forms
  - this is the data that we want to show on the URLS page.
  - therefore we need to pass along the urlDatabase to the template.
*/
const urlDatabase = {

};
// database of users intialize it to be empty
const users = {

};



/* ---------------------- HELPER FUNCTIONS DEFINED ---------------------------------------------------------------------------- */


/*
  This generateRandomString function simulates generating a "unique" shortURL, we will implement
  a function that returns a string of 6 random alphanumeric characters.
*/
const generateRandomString = function(stringLength) {
  // need to randomly generate characters and string them together
  // initial empty shortURL string that will be returned
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
};



/*
  - This emailChecker function checks to see if the email submitted in registration form is valid or not
  - email is not valid if the email already exists and/or the email string is undefined or empty
  - if valid email, return true, else return false
*/
const emailChecker = function(email, usersObject) {
  let validEmail = true;
  // check if email is empty, return validEmail = false
  if (email === "") {
    validEmail = false;
    return validEmail;
  }
  // check to if email is registered by another user
  let foundObject = getUserByEmail(email , usersObject);
  // if foundObject is undefined this means that email is valid as in its not already in use
  if (typeof foundObject === "undefined") {
    validEmail = true;
  } else {
    // email is in use so return false
    validEmail = false;
  }
  return validEmail;
};


/*
  - This urlsForUser function returns all the urls where the userID is equal to the id of the currently logged-in user in an object format
  - resultsObj = { shortURL1: longURL1, shortURL2 : longURL2 .....}
*/
const urlsForUser = function(id) {
  // resultsObj is an object that will hold all matching urls with given id
  let resultsObj = {};
  
  // scan urlDatabase to find if any userId matches given id
  for (let url in urlDatabase) {
    
    if (urlDatabase[url]["userID"] === id) {
      // since id match found, add url to resultsObj
      resultsObj[url] = urlDatabase[url];
    }
  }
  return resultsObj;
};



/*
  - This urlChecker function checks if given logged in-user with user_id created the URL that they are trying to access
*/
const urlChecker = function(user_id, shortURL) {
  // obtain the urls that belong to the user
  let userURLS = urlsForUser(user_id);

  // iterate through the userUrls object to see if there is a match with the shortURL.
  for (let key in userURLS) {

    if (key === shortURL) {
      // shortURL matches, so means the inputted shortURL does belong to the current logged-in user.
      return true;

    }
  }
  // key match not found, so return false, meaning the inputted shortURL does not belong to the logged-in user
  return false;
};


/*
  - This checkUrlExists function checks if a given shortURL exists in the url database,
    if it doesn't exist, an error message is presented.

*/
const checkUrlExists = function(shortURL, urlDatabase) {
  
  // iterate through the urlDatabase to check if the short URL is valid / exists. Key is the shortURL keys.
  for (let key in urlDatabase) {

    // check if key matches shortURL, return true if a match is found
    if (key === shortURL) {
      return true;
    }
    
  }
  // shortURL not found, so return false;
  return false;
};




/* ---------------------ROUTES FOR SERVER--------------------------------------------------------------------------------------------- */


/* GET REQUEST TO "/" */
app.get("/", (req,res) => {

  // Store user_id
  const user_id = req.session.user_id;

  // check if user_id is valid (i.e exists and has a value). If valid redirect to /urls page, else redirect to /login page.
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


/* HANDLES GET REQUEST TO "/urls/new  -- provides form to shorten a new url */

app.get("/urls/new", (req, res) => {

  // get the user_id stored as session
  const user_id = req.session.user_id;
  
  let templateVars = {};

  // check if user_id exists, i.e signed in , if yest then render the urls_new page
  if (user_id) {
    templateVars = {
      user: users[user_id]
    };

    res.render('urls_new', templateVars);

  } else {
    // user is not logged in so redirect to login page
    templateVars = {
      user: undefined
    };
    // redirect to login page
    res.redirect("/login");
  }
  
});


/* HANDLES GET REQUEST TO "/login  -- receives a request to go to upload login page for rendering */

app.get("/login", (req, res) => {
  // store user_id from cookie session
  const user_id = req.session.user_id;
  // check if user is logged in (i.e user_id is set). if logged in the redirect to /urls page
  if (user_id) {
    // redirect to /urls page
    res.redirect("/urls");
  } else {

    // user_id is not set (i.e not logged in so render login page)
    const templateVars = {
      user: undefined
    };

    // render the login page
    res.render('urls_loginPage.ejs',templateVars);
  }
});


/* HANDLES POST REQUEST TO "/urls" - receives a post request and post data */

app.post('/urls', (req, res) => {

  // store any user_id cookie sessions into variable userID
  const userID = req.session.user_id;

  // check if user_id cookie session is valid (i.e if user is logged in or not), if not logged in, send html error message
  if (!userID) {
    res.send("<h1>Error! User not logged in. Please login to create a new url!</h1>");

  } else {
    // user is valid so can make post request
    // extract longURL from request body
    const newLongURL = req.body.longURL;
    // generate random shortURL
    const shortURL = generateRandomString(6);
    // add the new shortURL - longURL , key-value pair to the urlDatabase object
    urlDatabase[shortURL] = { longURL: newLongURL, userID: userID};

    //add status code 302 and redirect to shortURL page
    res.status(302);
    res.redirect(`/urls/${shortURL}`);

  }
});


/* HANDLES POST REQUEST TO "/urls/:shortURL/delete" - removes a URL resource */

app.post("/urls/:shortURL/delete", (req , res) => {

  // store user_id from cookie-session
  let userId = req.session.user_id;

  // obtain shortURL from request parameters
  const shortURLID = req.params.shortURL;
  
  // Check if user is logged in, if yes, then check if url belongs to given user. If yes, then delete url. Else send an error message.
  if (userId) {
    // check if url belongs to user_id, if no send error message, if yes then proceed to delete url from database.
    let urlBelongs = urlChecker(userId, shortURLID);
    if (urlBelongs === false) {
      // send error message because url does not belong to logged in user
      res.send("<h1>Error! Sorry you can not delete this URL as you are not the creator/owner of this link");
    } else {

      delete urlDatabase[shortURLID];
      res.redirect("/urls");
    }
    
  } else {
    // send error message because user is not logged in
    res.send("<h1>Error! To delete a url you must be logged in and must own the url</h1>");
  }

});


/* HANDLES POST REQUEST TO "/urls/:shortURL" - updates longURL */

app.post("/urls/:shortURL", (req, res) => {

  //get the short URL from the request body
  const shortURL = req.params.shortURL;
  // get userID from cookie session
  let userID = req.session.user_id;
  //get the new long URL from the request body
  const newLongURL = req.body.newURL;

  // check if userID is logged in, if yes then check if shortURL belongs to user. If belongs then proceed with update. Else error message.
  if (userID) {
    // check if the shortURL belongs to the existing logged in user
    let urlBelongs = urlChecker(userID, shortURL);
    if (urlBelongs === false) {
      res.send("<h1>Error! Sorry you do not have access to this URL page on this app, as you are not the creator/owner of this link");
    } else {
      // itereate through urlDatabase to find the long url corresponding to the shortURL and update it.
      for (let shortURLKey in urlDatabase) {
        if (shortURLKey === shortURL) {
          // updat longURL inside the database
          urlDatabase[shortURLKey]["longURL"] = newLongURL;
      
        }
      }
      // redirect to urls page
      res.redirect('/urls');
    }

  } else {
    // user is not logged in so send error message
    res.send("Error! User not logged in so can not make changes to update URL!");
  }
});


/* HANDLES POST REQUEST TO ROUTE "/login" */

app.post("/login", (req, res) => {

  // store email and password from body request
  const email = req.body.email;
  const password = req.body.password;
  // get user object corresponding to submitted email
  const userObject = getUserByEmail(email , users);
  
  // if email is an empty string , return 403 error.
  if (email === "") {
    res.status(403).send("<h1>Status Error Code: 403 . Empty email address was submitted</h1>");
  } else if (typeof userObject === "undefined") {

    // if email does not exist in database, userObject would be type undefined, so return 403 error.
    res.status(403).send("<h1>Status Error Code: 403 . Email Address is not found!</h1>");
  } else {
    // email is valid (i.e exists inside database, so next check passwords

    // Check if passwords match (i.e what was entered vs. what was inside the database).
    if (bcrypt.compareSync(password, userObject.password)) {
      // password is valid - enable successful login - (since email + password match).
  
      // set the user_id session cookie
      req.session["user_id"] = userObject.id;
      // redirect to urls page
      res.redirect('/urls');
    } else {
      // passwords do not match send a 403 error
      res.status(403).send("<h1>Status Error Code: 403. Passwords do not match!</h1>");

    }
    
  }

});


/* HANDLES POST REQUEST TO "/logout" - clears session cookies */

app.post("/logout", (req,res) => {

  // clear the session cookies
  req.session = null;
  // redirect to the main urls page
  res.redirect('/urls');

});


/* HANDLES POST REQUEST TO "/register" - to allow new user registration to happen */

app.post("/register", (req, res) => {

  // check if email is valid if its not send a 404 status code error
  let isValidEmail = emailChecker(req.body.email, users);

  if (isValidEmail === false) {
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Email is already in use or an empty email address was submitted</h1>");

  } else if (req.body.password === "") {
    res.status(400).send("<h1>Status Error Code: 400 Bad Request. Password can not be empty, must be filled out.</h1>");

  } else {
    // email is valid so can proceed with registration process

    // generate random userID
    const userId = generateRandomString(8);
    // hash the password and store it into variable
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    // store userEmail from request body
    const userEmail = req.body.email;

    // create object to store user's email and password values using the req.body values for input from ejs template
    const newUser = {
      id: userId,
      email: userEmail,
      password: hashedPassword
    };

    // add new user object to the users database
    users[userId] = newUser;
   
    // set a user_id cookie containing the user's newly generated ID
    req.session["user_id"] = newUser.id;

    // redirect to the /urls page
    res.redirect("/urls");
  }
  
});


/* HANDLES GET REQUEST TO "/register" - to render registration page with form */

app.get("/register", (req, res) => {

  // obtain userID from cookie session
  let userID = req.session.user_id;
  // check if user is logged in, and if logged in then redirect to /urls page. if not logged in, render login page
  if (userID) {

    res.redirect('/urls');

  } else {
    // user not logged in so user key is set to undefined value inside templateVars, for rendering purposes
    const templateVars = {
      user: undefined
    };
    // user not logged so render login page
    res.render("urls_registration", templateVars);
  }
});


/* HANDLES GET REQUEST TO "/urls" - will show all existing shoretened urls in database created by user */

app.get("/urls", (req, res) => {
  
  // store cookie-session user_Id
  const userId = req.session.user_id;
  
  let templateVars = {};
  
  // check if user is logged in (i.e userId is truthy). Based on if logged in or not render the urls page with logged in or not logged in.
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
    res.send("<h1>Error! To view URLs you must be logged in!</h1>");
  }
 
});


/* HANDLES GET REQUEST TO "/u/:shortURL" - redirecting short URLS to long URL versions actual site */

app.get("/u/:shortURL", (req, res) => {

  // extract shortURL from req.params
  const shortURLID = req.params.shortURL;
  // check if shortURL exists inside the urls database, if it does not then return error html message
  let urlExists = checkUrlExists(shortURLID, urlDatabase);
  
  if (urlExists === false) {
    res.send("<h1>Error! URL does not exist inside database!");
    
  }

  // using the shortURL in the request, extract the longURL from the urlsDatabase object
  const longURL = urlDatabase[shortURLID]["longURL"];
  // redirect using longURL
  res.redirect(longURL);
});


/* HANDLES GET REQUEST TO "/urls/:shortURL" */

app.get("/urls/:shortURL", (req, res) => {
  
  // store cookie-session's user_id value
  let user_id = req.session.user_id;

  // if user_id does not exist return error, else proceed with request
  if (!user_id) {
    res.send("<h1>Error: not logged in!</h1>");

  } else {
    
    // store the short url from the parameters in the request
    let shortURL = req.params.shortURL;

    // check if shortURL is valid, i.e exists inside the urlDatabase
    let urlIsValid = checkUrlExists(shortURL, urlDatabase);

    // check if url is valid, if not send error
    if (!urlIsValid) {

      res.send("<h1>Error! Invalid short url! Does not exist in database!</h1>");
      
    } else {

      // check if the shortURL belongs to the existing logged in user
      let urlBelongs = urlChecker(user_id, shortURL);

      // if url does not belong(i.e urlBelongs === false), send error.
      if (urlBelongs === false) {
        res.send("<h1>Error! Sorry you do not have access to this URL page on this app, as you are not the creator/owner of this link");
      } else {

        // initialize user object and templateVars
        let  userObject = users[user_id];
      
        const templateVars = {
          shortURL: shortURL,
          longURL : urlDatabase[req.params.shortURL]["longURL"],
          user: userObject
        };

        // render the urls_show page
        res.render("urls_show", templateVars);

      }
    }
  }
});


// Activate server, i.e setup server to start listening on port 8080

app.listen(PORT, () => {

  console.log(`Example app listening on port ${PORT}!`);

});

