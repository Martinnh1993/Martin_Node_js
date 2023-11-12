const express = require("express");
const { initializeApp } = require("firebase/app");
const { getAuth, createUser, signOut, signInWithEmailAndPassword, onAuthStateChanged } = require("firebase/auth");

const app = express();

const firebaseConfig = {
    apiKey: "AIzaSyC0QCCggQhCeUDUFgcQOMcFB7_2wYqd20A",
    authDomain: "nodejsmandatory2.firebaseapp.com",
    projectId: "nodejsmandatory2",
    storageBucket: "nodejsmandatory2.appspot.com",
    messagingSenderId: "237598395479",
    appId: "1:237598395479:web:d4b2e838176607d2d6a712"
};

    // init firebase app
    initializeApp(firebaseConfig);

    const admin = require('firebase-admin');
    const credentials = require('./serviceAccountKey.json');

    admin.initializeApp({
        credential: admin.credential.cert(credentials)
    });

    app.use(express.json);
    app.use(express.urlencoded({extended: true}))

    const db = admin.firestore();

    app.post('/create', async (req, res) => {
        try {
            const id = req.body.email;
            const userJson = {
                /* name: req.body.name, */
                email: req.body.email,
                password: req.body.password
            };
    
            // Await the promise returned by set()
            await db.collection("Users").doc(id).set(userJson);
    
            res.status(200).json({ message: 'User created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create user' });
        }
    });
    

    const PORT = 8080;
    app.listen(PORT, (error) => {
        if (error) {
            console.log("Server failed to start", error);
            return;
        }
        console.log("Server is running on port", PORT);
    });
