const express = require("express");
const app = express();

app.use(express.json());

const mountains = [
    { id: 1, name: "Mount Fuji", height: 3776 },
    { id: 2, name: "Killimanjaro", height: 5895 },
    { id: 3, name: "Himmelbjerget", height: 147 }
];


app.get("/mountains", (req, res) => {
    res.send({ data: mountains });
});

app.get("/mountains/:id", (req, res) => {
    const pathVariableMountainId = Number(req.params.id);
    if (!pathVariableMountainId) {
        res.send({ error: "The mountain id must be a number" });
    } else {
        const foundMountain = mountains.find((mountain) => mountain.id === pathVariableMountainId);

        res.send({ data: foundMountain });
    }
});


const PORT = 8080;
app.listen(PORT, (error) => {
    if (error) {
        console.log("Error starting the server", error);
        return;
    }
    console.log("Server is running on port", PORT);
});

let currentId = 3;

app.post("/mountains", (req, res) => {
    const newMountain = req.body;
    newMountain.id = ++currentId;
    mountains.push(newMountain);
    res.send({ data: newMountain });
});

app.patch("/mountains/:id", (req, res) => {
    let foundIndex = mountains.findIndex((mountain) => mountain.id === Number(req.params.id));
    if (foundIndex === -1) {
        res.status(404).send({ error: `Could not find mountain by id ${req.params.id}` });
    } else {
        mountains[foundIndex] = { ...mountains[foundIndex], ...req.body, id: Number(req.params.id) };
        res.send({ data: mountains[foundIndex] });
    }
});

app.delete("/mountains/:id", (req, res) => {
    const foundIndex = mountains.findIndex((mountain) => mountain.id === Number(req.params.id));
    if (foundIndex === -1) {
        res.status(404).send({ error: `Could not find mountain by id ${req.params.id}` });
    } else {
        mountains.splice(foundIndex, 1);
        res.send({ data: Number(req.params.id) });
    }
});

