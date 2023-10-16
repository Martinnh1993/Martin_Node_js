const express = require("express");
const app = express();
const path = require("path");

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, "public")));


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});

app.get("/home", (req, res) => {
    res.sendFile(__dirname + "/public/intro.html");
});

var users = [
    {
        username: 'admin',
        password: 'password'
    },
    {
        username: 'user1',
        password: '1234'
    }
];

function check(req, res) {
    const { userid, pswrd } = req.query; // Get username and password from the query string
    const user = users.find(user => user.username === userid && user.password === pswrd);

    if (user) {
        res.redirect("/intro.html"); // Redirect to the second page on successful login
    } else {
        res.send("Error: Incorrect Password or Username"); // Send an error message
    }
}

app.get("/login", check);

const PORT = 8080;
app.listen(PORT, (error) => {
    if (error) {
        console.log("Server failed to start", error);
        return;
    }
    console.log("Server is running on port", PORT);
});
