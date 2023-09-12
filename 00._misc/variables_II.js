"use strict";

// totalHlovalVariable = "Never EVER!!! do this!!!"
var glovalVariable = "Also never!!! do this!!";

// can't do this
// const isThisConstant;

// cant do this
// const isThisConstant = 123;
// isThisConstant = 456;

const isThisConstant = [];
isThisConstant.push(1,2,3);
console.log(isThisConstant);

const anotherConstant = {};
anotherConstant.valueChange = true;
console.log(anotherConstant);



//global scope

function anotherScope() {
    // function scope
}

{
    // block scope
}

{
    console.log("Hello i am in a block scope");
}

{
var someVariable = true;
{
    var someVariable = false;
}
console.log(someVariable);
}

for (var i = 0; i <=5; i++) {
    setTimeout(() => {
        console.log(i);
    }, 1000);
}