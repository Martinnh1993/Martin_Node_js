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

// Endpoint to handle post-signup logic
app.post('/signup', (req, res) => {
  // Extract user details from the request body
  const { email, password } = req.body;

  admin.auth().createUser({
    email: email,
    password: password
  })
  .then(userRecord => {
    // User created successfully in Firebase Auth
    // Now perform any server-side setup, like creating a user profile in your database
    // ...
    res.status(200).send({ uid: userRecord.uid });
  })
  .catch(error => {
    // Handle signup errors
    res.status(500).send(error.message);
  });
});

const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587, 
  secure: false, // Note that secure is set to false since port 587 is typically used with STARTTLS
  auth: {
    user: 'DevDummy@outlook.dk', 
    pass: 'Dummy1234' 
  },
});


app.post('/forgot-password', (req, res) => {
  const { email } = req.body;
  console.log("server.js L 143");

  admin.auth().generatePasswordResetLink(email, {
    // Additional settings can go here, such as redirect URL after reset
  })
  .then((resetLink) => {
    const mailOptions = {
      from: 'DevDummy@outlook.dk', // Your Outlook email
      to: email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    };

    return transporter.sendMail(mailOptions);
  })
  .then(() => {
    res.send('Password reset email sent.');
  })
  .catch((error) => {
    console.error("Error sending password reset email:", error);
    // Send a JSON response with the error message
    res.status(500).json({ error: 'Error sending password reset email.' });
  });  
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
