import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import admin from 'firebase-admin';
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import session from 'express-session';
import nodemailer from 'nodemailer'

const keyPath = join(process.cwd(), 'adminKey.json');
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'DevDummy@outlook.dk',
    pass: 'etwurlfvdrwhdyvh'
  },
  tls: {
    // It's okay to use this for local development, but remove it for production
    rejectUnauthorized: false
  }
});



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
    secure: false, // should be true in production when using HTTPS
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
  const idToken = req.header('Authorization').split('Bearer ')[1];

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      // Set the UID in the session
      req.session.uid = decodedToken.uid;

      // Save the session
      req.session.save(err => {
        if (err) {
          // If there's an error saving the session, send an error response
          return res.status(500).send('Could not save session');
        }
        // If the session is saved successfully, send a success response
        res.status(200).send({ status: 'success', uid: decodedToken.uid });
      });
    })
    .catch(error => {
      // If token verification fails, send an unauthorized response
      res.status(401).send('You are not authorized');
    });
});

app.post('/sessionLogout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).send('Could not log out');
    } else {
      // The response must be handled by the client to ensure a proper redirect
      res.status(200).send('Logged out successfully');
    }
  });
});

// signup endpoint
app.post('/signup', (req, res) => {
  const { email } = req.body;

  sendWelcomeEmail(email)
    .then((info) => {
      console.log('Email sent:', info);
      res.status(200).send({ message: 'Welcome email sent.' });
    })
    .catch(error => {
      console.error("Error sending welcome email:", error);
      res.status(500).json({ error: error.message });
    });
});

function sendWelcomeEmail(email) {
  const mailOptions = {
    from: 'DevDummy@outlook.dk',
    to: email,
    subject: 'Welcome to the App!',
    html: `<h1>Welcome</h1><p>Congratulations ${email}, you have successfully signed up for my app.</p>`
  };

  // Return the promise from transporter.sendMail
  return transporter.sendMail(mailOptions);
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
