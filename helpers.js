// this function returns the user object corresponding to a given email. If email not found, returns user undefined.
const getUserByEmail = function(email , users) {
  
  // iterate through users database
  for (let userId in users) {
    // email match found return the user object
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  // email not found so return undefined
  return undefined;

};


module.exports = getUserByEmail;