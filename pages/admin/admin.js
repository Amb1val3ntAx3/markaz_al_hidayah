const correctPassword = "123";

// Convert Dropbox links to direct links
function convertDropboxLink(url) {
    if (url.includes("dropbox.com")) {
        // Change to direct download link
        return url
            .replace("www.dropbox.com", "dl.dropboxusercontent.com")
            .replace("dropbox.com", "dl.dropboxusercontent.com") // fallback
            .replace("?dl=0", "")
            .replace("&dl=0", "")
            .replace("&dl=1", "")
            .replace("?dl=1", "");
    }
    return url;
}

// Handle password check
document.getElementById('submitPassword').addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    if (password === correctPassword) {
        const screen = document.getElementById('passwordScreen');
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.style.display = 'none';
        }, 500);
        document.getElementById('adminForm').classList.add('active');
        document.body.classList.remove('no-scroll');
    } else {
        alert('Incorrect password, please try again.');
    }
});

// Handle form submission
document.getElementById('submitForm').addEventListener('click', async () => {
    const type = document.getElementById('contentType').value;
    const name = document.getElementById('nameInput').value;
    const audio = convertDropboxLink(document.getElementById('audioInput').value.trim());
    const imageInputRaw = document.getElementById('imageInput').value.trim();

    const image = imageInputRaw
        ? convertDropboxLink(imageInputRaw)
        : convertDropboxLink('https://www.dropbox.com/scl/fi/7amjc2l4fec5rcouxkif8/default.png?rlkey=23f6snpiy46gg25nhczgwnkvz&st=yw1ynu7o&dl=0');
    try {
        const response = await fetch('http://localhost:3000/update-json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type,
                name,
                audio,
                image,
                password: correctPassword
            })
        });

        const result = await response.json();
        if (result.success) {
            alert('Added successfully!');

            if (type === 'naxwe') {
                window.location.href = '../../pages/naxwah/naxwah.html';
            } else if (type === 'tafsir') {
                window.location.href = '../../pages/tafseer/tafseer.html';
            }

            document.getElementById('nameInput').value = '';
            document.getElementById('audioInput').value = '';
            document.getElementById('imageInput').value = '';
        } else {
            alert('Failed to add content. Please try again.');
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Server connection failed');
    }
});
