const { assert } = require('chai');
const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    // expected user is an object with the id, email and password
    const expectedUser = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };

    assert.deepEqual(user, expectedUser);
    assert.deepEqual(user.id, expectedOutput);
  });

  it('should return undefined when email is not in users database', function() {
    const user = getUserByEmail("hello@example.com", testUsers);
    const expectedOutput = "undefined";
    // Write your assert statement here
    // expect for user to be undefined to successfully pass test

    assert.deepEqual(user, undefined);
  });
});