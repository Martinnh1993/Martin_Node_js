let postId

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search)
    postId = urlParams.get('id')

    if (postId) {
        fetchPostDataForEditing(postId)
    } else {
        // Handle the case where no post ID is provided
        showToast('No post ID provided.', 'error')
    }

    // Listen for post changes
    socket.on('postChange', (change) => {
        if ((change.operationType === 'insert' || change.operationType === 'update') && change.documentKey._id === postId) {
            fetchPostDataForEditing()
        }
    })
})

function fetchPostDataForEditing() {
    fetch(`http://localhost:9000/api/post/${postId}`)
        .then(response => response.json())
        .then(post => {
            populateEditFields(post)
        })
        .catch(error => {
            showToast(error ,'error')
        })
}

function populateEditFields(post) {
    // Get the existing input fields from the form
    const titleInput = document.getElementById('edit-title')
    const contentInput = document.getElementById('edit-content')
    const imagePreview = document.getElementById('edit-image-preview')

    // Populate the fields with the post data
    titleInput.value = post.posts.title
    contentInput.value = post.posts.content
    imagePreview.src = post.posts.image.url

    // Set up an event listener for the form submission
    const editForm = document.getElementById('edit-form')
    editForm.addEventListener('submit', function(e) {
        e.preventDefault()
        submitPostUpdate(post.posts._id)
    })
}

function submitPostUpdate() {
    const updatedTitle = document.getElementById('edit-title').value
    const updatedContent = document.getElementById('edit-content').value
    const imagePreview = document.getElementById('edit-image-preview')
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    if (!userInfo || !userInfo.token) {
        showToast('You must be logged in to update posts.', 'error')
        return
    }

    // Function to convert blob to Base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onload = () => resolve(reader.result)
            reader.onerror = error => reject(error)
        });
    }

    // Check if the image was updated
    if (imagePreview.src.startsWith('blob:')) {
        fetch(imagePreview.src)
            .then(response => response.blob())
            .then(blob => blobToBase64(blob))
            .then(base64Image => {
                // Send update request with image
                sendUpdateRequest(updatedTitle, updatedContent, base64Image)
            })
            .catch(error => {
                console.error('Error processing image:', error)
                showToast('Error processing image', 'error')
            });
    } else {
        // Send update request without image
        sendUpdateRequest(updatedTitle, updatedContent)
    }
}

function sendUpdateRequest(title, content, base64Image = null) {
    // Retrieve userInfo within the function scope
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (!userInfo || !userInfo.token) {
        showToast('You must be logged in to update posts.', 'error')
        return
    }

    const postData = {
        title: title,
        content: content,
    };
    if (base64Image) {
        postData.image = base64Image
    }

    fetch(`http://localhost:9000/api/update/post/${postId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}` // Use the token from userInfo
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        return response.json()
    })
    .then(data => {
        showToast('The post has been updated', 'success')
    })
    .catch(error => {
        showToast(error, 'error');
    });
}

function setupDragAndDrop() {
    const dropArea = document.getElementById('dropArea')
    const imagePreview = document.getElementById('edit-image-preview')

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault()
        dropArea.classList.add('active')
    })

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('active')
    })

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault()
        dropArea.classList.remove('active')
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            imagePreview.src = window.URL.createObjectURL(file)
            imagePreview.style.display = 'block'
        }
    })
}

document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop()
})