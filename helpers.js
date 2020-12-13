const getUserByEmail = function(email , users){
  
  for (let userId in users) {
    // email match found return the user object
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  // email not found
  return undefined;

} 


module.exports = getUserByEmail;