function showToast(message, type) {
    let toast = document.createElement('div');
    toast.classList.add('toast');

    const successIconHTML = '<i class="fa-solid fa-circle-check"></i>'; // Success icon
    const errorIconHTML = '<i class="fa-solid fa-circle-exclamation"></i>'; // Error icon

    // Append the icon based on the message type
    toast.innerHTML = (type === 'success' ? successIconHTML : errorIconHTML) + ' ' + message;

    // Separately add the 'invalid' class for error messages
    if (type === 'error') {
        toast.classList.add('invalid');
    }

    // Append to #toastBox if it exists, otherwise to body
    const toastBox = document.getElementById('toastBox') || document.body;
    toastBox.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 6000);
}
