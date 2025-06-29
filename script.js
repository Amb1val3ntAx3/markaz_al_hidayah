document.addEventListener('DOMContentLoaded', function () {
  // === MOBILE MENU TOGGLE ===
  const menuIcon = document.querySelector('.menu-icon');
  const navLinks = document.querySelector('ul.nav-links');

  menuIcon.addEventListener('click', () => {
    navLinks.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('nav') && navLinks.classList.contains('show')) {
      navLinks.classList.remove('show');
    }
  });

  // === SCROLL FADE-IN EFFECTS ===
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  });

  document.querySelectorAll('.fade-in-on-scroll, .slide-in-left, .slide-in-right').forEach(el => {
    observer.observe(el);
  });

  // === DETERMINE WHICH JSON TO LOAD ===
  const pageToJsonMap = {
    'naxwah': 'naxwe.json',
    'tafseer': 'tafsir.json'
  };

  const path = window.location.pathname.toLowerCase();
  let jsonFile = '/storage/naxwe.json'; // default fallback

  for (const key in pageToJsonMap) {
    if (path.includes(key)) {
      jsonFile = `/storage/${pageToJsonMap[key]}`;
      break;
    }
  }

  // === FETCH & RENDER CARDS ===
  fetch(jsonFile)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const container = document.getElementById('cardFolder');
      if (!container) return;

      container.innerHTML = '';

      data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('item');

        // Arabic-styled heading block using item.name
        const cardHTML = `
          <div class="card-image arabic-text">
            ${item.name}
          </div>
          <audio src="${item.audio}"></audio>
          <progress value="0" max="100" class="progress-bar"></progress>
          <div class="audio-controls">
              <button class="download-button" title="Download">&#128229;</button>
              <button class="play-button" title="Play/Pause">&#9658;</button>
              <button class="speed-button" title="Speed">1×</button>
          </div>
        `;

        card.innerHTML = cardHTML;
        container.appendChild(card);

        // === AUDIO FUNCTIONALITY ===
        const audio = card.querySelector('audio');
        const progressBar = card.querySelector('.progress-bar');
        const playButton = card.querySelector('.play-button');
        const downloadButton = card.querySelector('.download-button');
        const speedButton = card.querySelector('.speed-button');

        downloadButton.addEventListener('click', () => {
          const link = document.createElement('a');
          link.href = audio.src;
          link.download = (item.name || 'audio') + '.mp3';
          link.click();
        });

        const speeds = [1, 1.5, 2];
        let currentSpeedIndex = 0;

        speedButton.addEventListener('click', () => {
          currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
          const newSpeed = speeds[currentSpeedIndex];
          audio.playbackRate = newSpeed;
          speedButton.textContent = newSpeed + '×';
        });

        playButton.addEventListener('click', () => {
          if (audio.paused) {
            audio.play()
              .then(() => playButton.textContent = '❚❚')
              .catch(err => console.error("Play failed:", err));
          } else {
            audio.pause();
            playButton.textContent = '▶';
          }
        });

        audio.addEventListener('timeupdate', () => {
          if (audio.duration) {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
          }
        });

        progressBar.addEventListener('click', (e) => {
          const percent = e.offsetX / progressBar.offsetWidth;
          audio.currentTime = percent * audio.duration;
        });
      });
    })
    .catch(error => {
      console.error(`Failed to load audio cards:`, error);
    });
});
