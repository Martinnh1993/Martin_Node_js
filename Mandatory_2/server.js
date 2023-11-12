import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';


const keyPath = join(process.cwd(), 'adminKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(join(dirname(fileURLToPath(import.meta.url)), 'public')));

// Middleware to protect routes
const checkAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).send('You are not authorized');
  }
};

// Main route that requires the user to be authenticated
app.get('/', checkAuth, (req, res) => {
  res.sendFile(join(dirname(fileURLToPath(import.meta.url)), 'public', 'index.html'));
});

// Add Book API endpoint
app.post('/addBook', checkAuth, async (req, res) => {
  const { title, author } = req.body;
  try {
    const db = admin.firestore();
    const docRef = await db.collection('books').add({
      title,
      author,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.status(200).send({ id: docRef.id });
  } catch (error) {
    res.status(400).send('Error adding book');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
