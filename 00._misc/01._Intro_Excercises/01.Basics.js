// --------------------------------------
// Variables, strings, numbers, floats
// --------------------------------------
// Exercise 1 - Console and constiables

const firstName = "Anders";
const lastName = "Latif";
// EXERCISE
// show in the console
// My first name is Anders and my last name is Latif
console.log(`my name is ${firstName} and my last name is ${lastName}`);

// --------------------------------------
// Exercise 2 - Numbers and Strings

const year = "2022";
const number = 1;
// Add the year plus the number
// The result should be 2023
// You cannot touch line 1 or 2

// +year virker ligesom Number(year) eller parseInt(year)
//Number(string) giver not a number frem for at faile
let newYaer = parseInt(year);
console.log(newYaer + number);
// --------------------------------------