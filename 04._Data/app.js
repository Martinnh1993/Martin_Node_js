const express = require("express");
const app = express();

console.log(Date());
console.log(new Date());
console.log(Date.now());

const PORT = 8080;
app.listen(PORT, () => {
    console.log("Server is running on",PORT);
});

app.get("/date", (req, res) => {
    res.send({data: new Date()});
})

app.get("/month", (req, res) => {
    const date = new Date().toLocaleDateString('en-US', {month: 'long'});
    res.send({data: date})
})

app.get("/day", (req, res) => {
    const day = new Date().toLocaleDateString(day);
    res.send({data: day})
})