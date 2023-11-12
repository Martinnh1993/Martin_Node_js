import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const collectionRef = collection(db, 'books');
const q = query(collectionRef, orderBy('createdAt'));
  
onAuthStateChanged(auth, (user) => {
    if (user) {
      // Redirect to the main content page after successful login
      window.location.href = '/home';
    } else {
      // Stay on the loginSignup.html page if not authenticated
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
  


  