// goisting
console.log(getRansomInt());

function getRansomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

const getRansomIntAnnoymousFunction = function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
};
const getRandomIntArrowFunction = (min, max) => {
    return Math.floor(Math.random() * (max + 1 - min) + min);
};

const getRandomIntArrowFunctionWithoutReturn = (min, max) => 
    Math.floor(Math.random() * (max + 1 - min) + min);

function genericActionperformer(genericAction, name) {
    // do things...
    return genericAction(name);
}

const jump = (name) => `${name} is jumping`;
console.log(genericActionperformer(jump, "Lasse"));
// Desired result: Lasse is jumping

function run(name) {
    return `${name} is running`;
}
//const run = (name) => `${name} is running`;
console.log(genericActionperformer(run, "Jonathan"));
// Desired result "Jonathan is running"

// Desired result is "Daniel is sleeping"
// Create a speel callback and get the desired result
// in a singel statement!!!
console.log(genericActionperformer((name) => `${name} is sleeping`),"Daniel");

// ASI