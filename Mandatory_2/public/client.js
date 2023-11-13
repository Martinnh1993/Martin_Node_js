import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js';

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

const db = getFirestore(firebaseApp);
const collectionRef = collection(db, 'books');
const q = query(collectionRef, orderBy('createdAt'));
  
  onAuthStateChanged(auth, (user) => {
    const path = window.location.pathname;
    if (!user && path !== '/loginSignup.html') {
        window.location.href = '/loginSignup.html';
    } else if (user && path !== '/home') {
        window.location.href = '/home';
    }
  });


  // Function to render books
  function renderBooks(doc) {
    let li = document.createElement('li');
    let title = document.createElement('span');
    let author = document.createElement('span');
    let cross = document.createElement('div');
  
    li.setAttribute('data-id', doc.id);
    title.textContent = doc.data().title;
    author.textContent = doc.data().author;
    cross.textContent = 'x';
  
    li.appendChild(title);
    li.appendChild(author);
    li.appendChild(cross);
  
    const bookList = document.querySelector('#book-list');
    bookList.appendChild(li);
  
    // Deleting books
    cross.addEventListener('click', (e) => {
      e.stopPropagation();
      let id = e.target.parentElement.getAttribute('data-id');
      deleteBookById(id)
        .then(() => {
          console.log('Document successfully deleted!');
        })
        .catch((error) => {
          console.error('Error deleting document: ', error);
        });
    });
  }
  
  // Function to delete a book by ID
  function deleteBookById(bookId) {
    const docRef = doc(db, 'books', bookId);
    return deleteDoc(docRef);
  }
  
  // Real-time listener for the books collection
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
  
  // Assign the login function to the window object to make it globally accessible
  window.login = function(event) {
    debugger;
    event.preventDefault();
    const auth = getAuth(); // Assuming you've already initialized Firebase
    const loginForm = document.getElementById("login-form");
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // ... handle the sign-in
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Authentication failed:", errorCode, errorMessage);
      });
  };

  