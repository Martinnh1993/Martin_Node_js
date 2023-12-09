// create a new post
function createPost() {
    const title = document.getElementById('postTitle').value
    const content = document.getElementById('postContent').value
    const imageElement = document.getElementById('imagePreview')
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))

    if (!userInfo || !userInfo.token) {
        showToast('User is not logged in or token is missing.', 'error')
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

    if (imageElement.src && imageElement.src.startsWith('blob:')) {
        // Fetch the blob from the blob URL and then convert to Base64
        fetch(imageElement.src)
            .then(response => response.blob())
            .then(blob => blobToBase64(blob))
            .then(base64Image => {
                // Once converted, send the request with the image
                sendPostRequest(title, content, base64Image)
                window.location.href = 'home.html'
            }).catch(error => {
                showToast('Error processing image:', error)
            });
    } else {
        // If no image, send the request without it
        sendPostRequest(title, content)
        window.location.href = 'home.html'
    }
}

// send request for create post
function sendPostRequest(title, content, image = null) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const requestData = { title, content }
    if (image) requestData.image = image

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
                showToast('server responds with an error!', 'error')
                throw new Error('Server responded with an error!')
            }
            return response.json()
        })
        .then(data => {
            console.log("Success:", data)
            showToast(data, 'Success')
        })
        .catch(error => {
            showToast(error, 'error')
        })
}

// drag and drop for the image
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dropArea')) {
        setupDragAndDrop()
    }
})

function setupDragAndDrop() {
    const dropArea = document.getElementById('dropArea')
    const imageInput = document.getElementById('postImage')
  
    // Create the imagePreview element as an img element
    const imagePreview = document.createElement('img')
    imagePreview.id = 'imagePreview'
    imagePreview.style.display = 'none'
    imagePreview.classList.add('previewImage')
  
    // Append the imagePreview element to the dropArea div
    dropArea.appendChild(imagePreview)
  
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
      handleDroppedImage(file, dropArea, imagePreview)
    })
  
    function handleDroppedImage(file, dropArea, imagePreview) {
      const img = new Image()
  
      img.onload = function () {
        const elementToRemove = document.getElementById('dragDropText');
        if (elementToRemove) {
          elementToRemove.remove()
        }
        dropArea.classList.remove('drop-area')
  
        // Set the new image source
        imagePreview.src = window.URL.createObjectURL(file)
  
        // Show the image preview by setting its display to 'block'
        imagePreview.style.display = 'block'
      };
  
      img.src = window.URL.createObjectURL(file)
    }
  }