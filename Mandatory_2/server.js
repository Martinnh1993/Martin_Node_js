import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import session from 'express-session';


const keyPath = join(process.cwd(), 'adminKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(join(dirname(fileURLToPath(import.meta.url)), 'public')));
 
const checkAuth = async (req, res, next) => {
  // Check for a session or cookie instead of a token
  if (req.session.uid) {
    next();
  } else {
    res.status(401).send('You are not authorized');
  }
};
app.use(session({
  secret: 'your_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // or a similar check
    httpOnly: true
  }
}));

app.use('/home', checkAuth); // Make sure this comes after the session middleware

// Main route serves the login/signup page by default
app.get('/', (req, res) => {
  res.sendFile(join(dirname(fileURLToPath(import.meta.url)), 'public', 'loginSignup.html'));
});

// Protected route for authenticated users to access the main content
app.get('/home', checkAuth, (req, res) => {
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


app.post('/sessionLogin', (req, res) => {
  // ... verify ID token ...
  req.session.uid = decodedToken.uid; // Set the UID in the session
  req.session.save(err => { // Make sure to save the session
    if (err) {
      return res.status(500).send('Could not save session');
    }
    res.status(200).send({ status: 'success', uid: decodedToken.uid });
  });
});






// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
