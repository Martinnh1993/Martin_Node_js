const express = require("express");
const app = express();

    let mountains = [
        { id: 1, name: 'Mount Everest', height: 8848 },
        { id: 2, name: 'K2', height: 8611 },
        { id: 3, name: 'Kangchenjunga', height: 8586 },
        { id: 4, name: 'Lhotse', height: 8516 },
        { id: 5, name: 'Makalu', height: 8485 },
    ];
   
    // GET all mountains
app.get('/mountains', (req, res) => {
  res.send(mountains);
});

// GET a specific mountain by ID
app.get('/mountains/:id', (req, res) => {
  const mountainId = parseInt(req.params.id);
  const mountain = mountains.find((m) => m.id === mountainId);

  if (!mountain) {
    res.status(404).send({ error: 'Mountain not found' });
  } else {
    res.send(mountain);
  }
});

// POST a new mountain
app.post('/mountains', (req, res) => {
  const newMountain = req.body;
  if (!newMountain.name || !newMountain.height) {
    res.status(400).send({ error: 'Name and height are required' });
  } else {
    const nextId = mountains.length + 1;
    newMountain.id = nextId;
    mountains.push(newMountain);
    res.status(201).send(newMountain);
  }
});

// PUT (update) a mountain by ID
app.put('/mountains/:id', (req, res) => {
  const mountainId = parseInt(req.params.id);
  const updatedMountain = req.body;

  const existingMountain = mountains.find((m) => m.id === mountainId);
  if (!existingMountain) {
    res.status(404).send({ error: 'Mountain not found' });
  } else {
    if (updatedMountain.name) {
      existingMountain.name = updatedMountain.name;
    }
    if (updatedMountain.height) {
      existingMountain.height = updatedMountain.height;
    }
    res.send(existingMountain);
  }
});

// DELETE a mountain by ID
app.delete('/mountains/:id', (req, res) => {
  const mountainId = parseInt(req.params.id);
  const index = mountains.findIndex((m) => m.id === mountainId);

  if (index === -1) {
    res.status(404).send({ error: 'Mountain not found' });
  } else {
    const deletedMountain = mountains.splice(index, 1);
    res.send(deletedMountain[0]);
  }
});

app.listen(8080);