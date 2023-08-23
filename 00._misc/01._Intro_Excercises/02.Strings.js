// --------------------------------------
// Exercise 3 - Add numbers from string to float

const numberOne = "1.10";
const numberTwo = "2.30";
const ex3One = Number(numberOne)
const ex3Two = Number(numberTwo)

// add those two numbers and show the result
// you cannot touch line 1 neither line 2
console.log(ex3One+ex3Two);

// --------------------------------------
// Exercise 4 - Add the numbers and the total with 2 decimals

const anotherNumberOne = "1.10";
const anotherNumberTwo = "2.30";
const tempNumber = Number(anotherNumberOne) + Number(anotherNumberTwo);
const result = tempNumber.toFixed(2);

console.log(result);


// --------------------------------------
// Exercise 5 - Decimals and average

const one = 10;
const two = 45;
const three = 98;

const avg = (one + two + three)/3
const avgDecimals = avg.toFixed(5)

// Show in the console the avg. with 5 decimals
console.log(avgDecimals);

// --------------------------------------
// Exercise 6 - Get the character by index

const letters = "abc";
const c = letters.charAt(2);
// Get me the character "c"
console.log(c);


// --------------------------------------
// Exercise 7 - Replace

const fact = "You are learning javascript!";

// capitalize the J in Javascript

const capitalizeFact = fact.replace('javascript', 'Javascript');
console.log(capitalizeFact);



// --------------------------------------