//use const whenever possible
const scheduleBreakTime = "09:27";
let consoleLogCounter = 0;

//use comma in console log
console.log("lets's take a break at:",scheduleBreakTime);
consoleLogCounter ++;

//type coercion

// The 3 ways to make strings

console.log("This is the first way '''''");
console.log('This is the secound way """"""');

//kan refererer til variabler og have regnestykker
console.log(`This is the third way ''''"""${scheduleBreakTime}`);
consoleLogCounter += 3;

console.log(consoleLogCounter);
