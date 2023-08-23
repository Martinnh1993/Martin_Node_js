// --------------------------------------
// Objects
// --------------------------------------
// Exercise 1 - Retrieve value from object by key
const myObj = { message: "Hello, earthling! I bring peace." };

// Log the message 
console.log(myObj.message);

// --------------------------------------
// Exercise 2 - Defining an object. 

const newObject = {name: "Martin", age: 30};
console.log(newObject.name);
console.log(newObject.age);

// Create an object that has your name and age. 


// --------------------------------------
// Exercise 3 - Add a property 

const stackOverflow = {};
stackOverflow.name = "Martin";
stackOverflow.age = 30;

console.log(stackOverflow.name);
console.log(stackOverflow.age);

// make a rule called isAllowed and let the value be true
stackOverflow.isAllowed = true;

console.log(stackOverflow.isAllowed);

// --------------------------------------
// Exercise 4 - Remove a property 

const thisSong = { description: "The best song in the world." };

// remove the property "description" and add a property called "about" that should say "Just a tribute." 

delete thisSong.description
thisSong.about = "Just a tribute.";

console.log(thisSong);
// --------------------------------------