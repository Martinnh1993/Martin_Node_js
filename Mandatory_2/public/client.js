import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';

// Initialize Firebase client SDK
const firebaseConfig = {
  apiKey: "AIzaSyC0QCCggQhCeUDUFgcQOMcFB7_2wYqd20A",
  authDomain: "nodejsmandatory2.firebaseapp.com",
  projectId: "nodejsmandatory2",
  storageBucket: "nodejsmandatory2.appspot.com",
  messagingSenderId: "237598395479",
  appId: "1:237598395479:web:d4b2e838176607d2d6a712"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const db = getFirestore();
const booksCollectionRef = collection(db, 'books'); // Use your actual collection name
const q = query(booksCollectionRef);

  onSnapshot(q, (snapshot) => {
    let changes = snapshot.docChanges();
    changes.forEach(change => {
      if (change.type === 'added') {
        renderBooks(change.doc);
      } else if (change.type === 'removed') {
        let li = document.querySelector(`[data-id='${change.doc.id}']`);
        if(li) {
          li.remove();
        }
      }
    });
  });
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, get the ID token
      user.getIdToken().then((idToken) => {
        // Send the ID token to your backend via HTTPS
        return fetch('/sessionLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include' // Include cookies in the request
        });
      })
      .then((response) => {
        if (response.ok) {
          console.log('Session login successful');
          // Redirect to the home page or other post-login action
          if (window.location.pathname !== '/index.html') {
            window.location.href = '/index.html'; // Redirect to the home page
          }
        } else {
          throw new Error('Session login failed');
        }
      })
      .catch((error) => {
        console.error('Error during session login:', error);
        // Optionally, handle the error, such as redirecting to an error page
      });
    } else {
      // User is signed out
      // Redirect to login page or handle accordingly
      if (window.location.pathname !== '/loginSignup.html') {
        window.location.href = '/loginSignup.html'; // Redirect to the login page
      }
    }
  });
  

  window.toggleForms = function(formToShow) {
    // Get references to all three forms
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
  
    // Hide all forms initially
    loginForm.style.display = 'none';
    signupForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
  
    // Only display the requested form
    if (formToShow === 'login') {
      loginForm.style.display = 'block';
    } else if (formToShow === 'signup') {
      signupForm.style.display = 'block';
    } else if (formToShow === 'forgotPassword') {
      forgotPasswordForm.style.display = 'block';
    }
  };

  // This function will create a list item for a book and append it to the book list
  function renderBooks(doc) {
    const bookListElement = document.getElementById('book-list');
    const li = document.createElement('li');
    li.setAttribute('data-id', doc.id);
    li.className = 'book-item'; // Add a class for styling
  
    const title = document.createElement('span');
    const author = document.createElement('span');
    const deleteBtn = document.createElement('button');
  
    title.textContent = doc.data().title; // Make sure 'title' field exists in your Firestore documents
    author.textContent = doc.data().author; // Make sure 'author' field exists in your Firestore documents
    deleteBtn.textContent = '×'; // Using a simple '×' character as the delete icon
    deleteBtn.className = 'delete'; // Add a class for styling if needed
  
    // Append the new elements to the list item
    li.appendChild(title);
    li.appendChild(author);
    li.appendChild(deleteBtn);
  
    // Append the list item to the book list
    bookListElement.appendChild(li);
  
    // Add event listener for delete button (cross icon)
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      let id = e.target.parentElement.getAttribute('data-id');
      deleteBookById(id); // Call the delete function
    });
  }

  window.addBook = function(event) {
    event.preventDefault(); // Corrected the method call with parentheses
    const addBookForm = document.getElementById('addBook-form');
    if (addBookForm) { // Check if the form exists
      const title = addBookForm['title'].value;
      const author = addBookForm['author'].value;
  
      // Add the new book to the Firestore collection
      addDoc(booksCollectionRef, {
        title: title,
        author: author,
        createdAt: serverTimestamp()
      }).then(() => {
        // Clear the form after adding the book
        addBookForm.reset();
      }).catch((error) => {
        // Handle errors here
        console.error("Error adding document: ", error);
      });
    } else {
      // Log an error if the form is not found
      console.error("The form with ID 'addBook-form' was not found.");
    }
  };

  
  // Function to delete a book by ID
  function deleteBookById(bookId) {
    const docRef = doc(db, 'books', bookId);
    return deleteDoc(docRef);
  }
  

  
  //Login function
  window.login = function(event) {
    event.preventDefault();
    
    const loginForm = document.getElementById("login-form");
    const email = loginForm.email.value;
    const password = loginForm.password.value;
  
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('Login successful:', user);
  
        // Redirect to the home page after successful login
        window.location.href = '/home'; // Replace '/home' with your home page URL
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Authentication failed:", errorCode, errorMessage);
      });
  };

  //signup function
  window.signup = function(event) {
    event.preventDefault();
    
    const signupForm = document.getElementById('signup-form')
    const email = signupForm.email.value;
    const password = signupForm.password.value;
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User is signed up, now get the ID token
        return userCredential.user.getIdToken();
      })
      .then((idToken) => {
        // Send the ID token to the server to establish a session
        return fetch('/sessionLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          credentials: 'include' // Necessary for cookies to be sent
        });
      })
      .then((response) => {
        if (response.ok) {
          // The session is established, redirect to the home page
          window.location.href = '/home';
        } else {
          throw new Error('Could not establish session after signup');
        }
      })
      .catch((error) => {
        // Handle errors, such as showing a message to the user
        console.error("Error during signup or session establishment:", error);
      });
  };

  //logout function
  window.logout = function(event) {
    console.log('Logout function called');
  
    signOut(auth).then(() => {
      console.log('User signed out');
      window.location.href = '/loginSignup.html';
    }).catch(error => {
      console.error('Sign out error', error);
    });
  };

  window.sendPasswordResetEmail = function(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-password-email').value;

    fetch('/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email })
    })
    .then(response => {
      if (response.ok) {
        return response.json(); // Only parse as JSON if response is ok
      } else {
        throw new Error('Server responded with an error.');
      }
    })
    .then(data => {
      if (data.message) {
        alert(data.message); // Alert the message from the server
      } else {
        alert('Password reset email sent.'); // Or a default success message
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to send reset email. Please try again.');
    });
  };
  
  
  