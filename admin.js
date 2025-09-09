
// === Convert Dropbox links to direct download links ===
function convertDropboxLink(url) {
  if (url.includes("dropbox.com")) {
    return url
      .replace("www.dropbox.com", "dl.dropboxusercontent.com")
      .replace("dropbox.com", "dl.dropboxusercontent.com")
      .replace(/\?dl=\d/, "")
      .replace(/&dl=\d/, "");
  }
  return url;
}

// === Password Verification ===
document.getElementById('submitPassword').addEventListener('click', async () => {
  const password = document.getElementById('adminPassword').value;

  try {
    const response = await fetch('/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('passwordScreen').style.opacity = '0';
      setTimeout(() => {
        document.getElementById('passwordScreen').style.display = 'none';
      }, 500);

      document.getElementById('adminForm').classList.add('active');
      document.body.classList.remove('no-scroll');
    } else {
      alert('Incorrect password. Try again.');
    }
  } catch (error) {
    alert('Server error. Please try later.');
  }
});

// === Form Submission Handler ===
document.getElementById('submitForm').addEventListener('click', async () => {
  const type = document.getElementById('contentType').value.trim();
  const name = document.getElementById('nameInput').value.trim();
  const audio = convertDropboxLink(document.getElementById('audioInput').value.trim());
  const imageInput = document.getElementById('imageInput').value.trim();
  const password = document.getElementById('adminPassword').value.trim();

  const image = imageInput || convertDropboxLink('https://www.dropbox.com/scl/fi/7amjc2l4fec5rcouxkif8/default.png?rlkey=23f6snpiy46gg25nhczgwnkvz&st=yw1ynu7o&dl=0');

  if (!type || !name || !audio) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    const response = await fetch('/update-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, name, audio, image, password })
    });

    const result = await response.json();

    if (result.success) {
      alert('Content added successfully!');
      if (type === 'naxwe') {
        window.location.href = '/naxwah';
      } else if (type === 'tafsir') {
        window.location.href = '/tafseer';
      } else if (type === 'fiqh') {
        window.location.href = '/fiqh';
      } else if (type === 'hadith') {
        window.location.href = '/hadith';
      }



      document.getElementById('nameInput').value = '';
      document.getElementById('audioInput').value = '';
      document.getElementById('imageInput').value = '';
    } else {
      alert('Failed: ' + (result.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error during fetch:', err);
    alert('Failed to connect to server.');
  }
});

