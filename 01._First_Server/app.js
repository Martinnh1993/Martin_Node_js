// import express
// const express = require("express");
// instantiate express
// const app = express();

const app = require("express")();

const otherData = 123; 

app.get("/", (req, res) => {
    res.send({ data: "This is the first request handler"});
});

app.get("/dog", (req, res) => {
    res.send({dog: "Woof"});
});

app.get("/dog/:id/:id2", (req, res) => {
    console.log(req.params);
    console.log(req.params.id2);
    res.send({ dog: "Meow"});
});

let balance = 100;
app.get("/wallet/:withdrawalAmount", (req, res) => {
    const withdraw = req.params.withdrawalAmount;
    balance -= withdrawalAmount;
    if (balance < 0) {
        balance += req.params.withdrawalAmount
        res.send({message: "You can't withdraw. No more money left"});
    } else {
        res.send({message: `You've withdrawn ${withdraw}`});
    }
});


// 80 http
// 443 https
// 8080 http developer
// 9090 https developer

app.listen(8080);



