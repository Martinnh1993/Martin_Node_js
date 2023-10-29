import './styles.css';

import { initializeApp } from 'firebase/app'
import { collection, onSnapshot, getFirestore, addDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyC0QCCggQhCeUDUFgcQOMcFB7_2wYqd20A",
    authDomain: "nodejsmandatory2.firebaseapp.com",
    projectId: "nodejsmandatory2",
    storageBucket: "nodejsmandatory2.appspot.com",
    messagingSenderId: "237598395479",
    appId: "1:237598395479:web:d4b2e838176607d2d6a712"
  };

  const bookList = document.querySelector('#book-list');

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
  
    bookList.appendChild(li);
  
    // Add a click event listener to the "x" (cross) element to delete the book
    cross.addEventListener('click', (e) => {
      e.stopPropagation();
      let id = e.target.parentElement.getAttribute('data-id');
  
      // Call the deleteBookById function
      deleteBookById(id)
        .then(() => {
          li.remove(); // Remove the deleted item from the UI
          console.log('Document successfully deleted!');
        })
        .catch((error) => {
          console.error('Error deleting document: ', error);
        });
    });
  }
  
    // init firebase app
    initializeApp(firebaseConfig);

    // init service
    const db = getFirestore();

    // collection reference 
    const collectionRef = collection(db, 'books');

    // queruis
    const q = query(collectionRef, orderBy('createdAt'));

    // real time collection data
    onSnapshot(q, (snapshot) => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            console.log(change.doc.data());
            if(change.type == 'added'){
                renderBooks(change.doc);
            } else if (change.type == 'removed'){
                let li = bookList.querySelector('[data-id=' + change.doc.id + ']');
                bookList.removeChild(li);
            }
        });
    });


    // adding documents 
    const addBookForm = document.querySelector('.add')
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();

        addDoc(collectionRef, {
            title: addBookForm.title.value,
            author: addBookForm.author.value,
            createdAt: serverTimestamp()
        })
        .then(() => {
            addBookForm.reset();
        })
    })

    // Define a function to delete a book by ID
    function deleteBookById(bookId) {
        const docRef = doc(db, 'books', bookId);
        return deleteDoc(docRef);
    }

    // get a single document
    const docRef = doc(db, 'books', 'aNpygD6JasxM3TEJssgS')
        onSnapshot(docRef, (doc) => {
            console.log(doc.data(), doc.id);
        })       