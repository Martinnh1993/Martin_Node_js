function createNewPostForm() {
    const userInfoJson = localStorage.getItem('userInfo');
    if (userInfoJson) {
        const userInfo = JSON.parse(userInfoJson);
        console.log(userInfo);

        // Check if the user is authenticated and is an admin
        if (userInfo.role === 'admin') {
            window.location.href = 'createPost.html';
        } else {
            alert('Only admin users can create posts.');
            // Optionally redirect to a different page or show an error message
        }
    } else {
        alert('You must be logged in to create posts.');
        // Redirect to login page or show an error message
    }
}

function createPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageElement = document.getElementById('imagePreview'); // The ID of your <img> element
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo || !userInfo.token) {
        console.error("User is not logged in or token is missing.");
        return;
    }

    // Function to convert blob to Base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    if (imageElement.src && imageElement.src.startsWith('blob:')) {
        // Fetch the blob from the blob URL and then convert to Base64
        fetch(imageElement.src)
            .then(response => response.blob())
            .then(blob => blobToBase64(blob))
            .then(base64Image => {
                // Once converted, send the request with the image
                sendPostRequest(title, content, base64Image);
                window.location.href = 'home.html';
            }).catch(error => {
                console.error("Error processing image:", error);
            });
    } else {
        // If no image, send the request without it
        sendPostRequest(title, content);
        window.location.href = 'home.html';
    }
}


function sendPostRequest(title, content, image = null) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const requestData = { title, content };
    if (image) requestData.image = image;

    fetch('http://localhost:9000/api/post/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
        },
        body: JSON.stringify(requestData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server responded with an error!');
            }
            return response.json();
        })
        .then(data => {
            console.log("Success:", data);
            // Handle success
        })
        .catch(error => {
            console.error("Error Creating Post:", error);
        });
}

function createPostCard(post) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    // Create card container
    const card = document.createElement('div');
    card.classList.add('post-card');

    // Create and set title
    const title = document.createElement('h2');
    title.textContent = post.title;
    card.appendChild(title);

    // Create and set date
    const date = document.createElement('p');
    date.textContent = new Date(post.createdAt).toLocaleDateString(); // Format date as needed
    date.style.color = 'lightgray'; // Set the date color to light gray
    card.appendChild(date);

    // Create and set image with fixed size
    if (post.image && post.image.url) {
        const img = document.createElement('img');
        img.src = post.image.url;
        img.alt = 'Post Image';
        img.style.width = '100%'; // Full width of the card
        img.style.height = '200px'; // Fixed height
        img.style.objectFit = 'cover'; // Ensures the image covers the area without stretching
        card.appendChild(img);
    }

    // Create and set content with limited height
    const content = document.createElement('p');
    content.textContent = post.content;
    content.style.height = '30px';
    content.style.overflow = 'hidden';
    card.appendChild(content);

    // Create interactions container
    const interactions = document.createElement('div');
    interactions.style.display = 'flex';
    interactions.style.justifyContent = 'space-between';
    interactions.style.alignItems = 'center';

    // Left side - Likes
    const likesContainer = document.createElement('div');

    // Heart icon for likes
    const heartIcon = document.createElement('i');
    const userLikesThisPost = post.likes.includes(userInfo.id);
    heartIcon.className = userLikesThisPost ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    heartIcon.style.cursor = 'pointer';
    heartIcon.style.color = 'red';
    heartIcon.onclick = function () {
        addRemoveLike(post._id, userLikesThisPost);
    };
    likesContainer.appendChild(heartIcon);

    // Number of likes
    const likesCount = document.createElement('span');
    likesCount.textContent = ` ${post.likes.length} Like(s)`;
    likesCount.style.color = 'white';
    likesContainer.appendChild(likesCount);

    interactions.appendChild(likesContainer);

    // Right side - Comments
    const commentsContainer = document.createElement('div');

    // Number of comments
    const commentsCount = document.createElement('span');
    commentsCount.textContent = `${post.comments.length} `;
    commentsCount.style.color = 'white';
    commentsContainer.appendChild(commentsCount);

    // Message icon for comments
    const messageIcon = document.createElement('i');
    messageIcon.className = 'fa-solid fa-message';
    messageIcon.style.cursor = 'pointer';
    messageIcon.style.color = 'blue';
    commentsContainer.appendChild(messageIcon);

    interactions.appendChild(commentsContainer);

    card.appendChild(interactions);

    return card;
}

document.addEventListener('DOMContentLoaded', function () {
    fetchPosts();

    socket.on('postChange', (change) => {
        if (change.operationType === 'insert' || change.operationType === 'update') {
            fetchPosts();
        }
    });

    socket.on('delete', () => {
        fetchPosts();
    });

    socket.on('update', () => {
        fetchPosts();
    });    
});

function fetchPosts() {
    fetch(`http://localhost:9000/api/posts/show`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.posts.length > 0) {
                const postContainer = document.getElementById('postContainer');
                postContainer.innerHTML = ''; // Clear existing posts
                data.posts.forEach(post => {
                    const postCard = createPostCard(post);
                    postContainer.appendChild(postCard);
                });
            }
        })
        .catch(error => console.error('Error fetching posts:', error));
}


function addRemoveLike(postId, isLiked) {
    // Check if user is logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo || !userInfo.token) {
        console.log('User not logged in or token is missing');
        return;
    }

    const url = isLiked ?
        `http://localhost:9000/api/removelike/post/${postId}` :
        `http://localhost:9000/api/addlike/post/${postId}`;

    // API request to add or remove the like
    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}` // Assuming you use token-based authentication
        }
    })
        .then(response => {
            if (!response.ok) {
                response.text().then(text => {
                    throw new Error(`Failed to toggle like: ${text}`);
                });
            }            
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Update the UI based on the new like status
                updateLikeUI(postId, data.post, !isLiked);
            } else {
                console.error('Error toggling like:', data.message);
            }
        })
        .catch(error => {
            console.error('Error toggling like:', error.message || error);
        });        
}

function updatePost(post) {
    // Assuming each post card has an id like 'post_123'
    const postCard = document.querySelector(`#post_${post._id}`);
    if (postCard) {
        // Update the like count
        const likeCountElement = postCard.querySelector('.like-count');
        if (likeCountElement) {
            likeCountElement.textContent = `${post.likes.length} Like(s)`;
        }

        // Optionally, update the like button appearance
        // For example, if you toggle a class based on whether the user has liked the post
    }
}

function updateLikeUI(postId, isLiked) {
    // Find the post in the DOM
    const postCard = document.querySelector(`#post_${postId}`); // Assuming each post has an ID like 'post_123'
    
    // Update the like button appearance
    const likeButton = postCard.querySelector('.like-button'); // Assuming there's a like button with class 'like-button'
    likeButton.classList.toggle('liked', isLiked); // Toggle a class to change the appearance

    // Update the like count
    const likeCountElement = postCard.querySelector('.like-count'); // Assuming there's a span or similar element for the like count
    let likeCount = parseInt(likeCountElement.textContent);
    likeCount = isLiked ? likeCount + 1 : likeCount - 1;
    likeCountElement.textContent = `${likeCount} Like(s)`;
}

function setupDragAndDrop() {
    const dropArea = document.getElementById('dropArea');
    const imageInput = document.getElementById('postImage');
  
    // Create the imagePreview element as an img element
    const imagePreview = document.createElement('img');
    imagePreview.id = 'imagePreview';
    imagePreview.style.display = 'none'; // Initially hide it
    imagePreview.classList.add('previewImage'); // Add the 'previewImage' class
  
    // Append the imagePreview element to the dropArea div
    dropArea.appendChild(imagePreview);
  
    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('active');
    });
  
    dropArea.addEventListener('dragleave', () => {
      dropArea.classList.remove('active');
    });
  
    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('active');
      const file = e.dataTransfer.files[0];
      handleDroppedImage(file, dropArea, imagePreview);
    });
  
    function handleDroppedImage(file, dropArea, imagePreview) {
      const img = new Image();
  
      img.onload = function () {
        const elementToRemove = document.getElementById('dragDropText');
        if (elementToRemove) {
          elementToRemove.remove();
        }
        dropArea.classList.remove('drop-area');
  
        // Set the new image source
        imagePreview.src = window.URL.createObjectURL(file);
  
        // Show the image preview by setting its display to 'block'
        imagePreview.style.display = 'block';
      };
  
      img.src = window.URL.createObjectURL(file);
    }
  }
  
  // Call the setupDragAndDrop function to set up the event listeners
  setupDragAndDrop();