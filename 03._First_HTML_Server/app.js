const express = require("express");
const app = express();


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/home.html");
});

app.get("/secondPage", (req, res) => {
    res.sendFile(__dirname + "/public/secondPage.html");
});

app.get("/welcomeMessage", (req, res) => {
    const clientName = req.query.user;
    if (!clientName) {
        res.send({data: "Hello stranger"})
    } else {
        res.send({data: `Welcome to my facy website, ${clientName}` })
    }
})



const PORT = 8080;
app.listen(PORT, (error) => {
    if (error) {
        console.log("Server failed to start", error);
        return;
    }
    console.log("Server is running on port", PORT);
});
