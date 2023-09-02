const express = require("express");
const app = express();

    let mountains = [
        { id: 1, name: 'Mount Everest', height: 8848 },
        { id: 2, name: 'K2', height: 8611 },
        { id: 3, name: 'Kangchenjunga', height: 8586 },
        { id: 4, name: 'Lhotse', height: 8516 },
        { id: 5, name: 'Makalu', height: 8485 },
    ];
   
    app.get('/mountains', (req, res) => {
        res.send(mountains);
    });

    app.get('/mountains/:id', (req, res) => {
        const mountainId = parseInt(req.params.id);
        const mountain = mountains.find((m) => m.id === mountainId);
      
        if (!mountain) {
          res.status(404).send({ error: 'Mountain not found' });
        } else {
          res.send(mountain);
        }
    });



app.listen(8080);