document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('ul.nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('show');
    });

    // Close menu if clicked outside nav and menu is open
    document.addEventListener('click', (e) => {
        if (!e.target.closest('nav') && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    });

    // Your existing animation and expand button code
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(button => {
        button.addEventListener('click', function() {
            const surahItem = this.closest('.surah-item');
            surahItem.classList.toggle('active');
        });
    });

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

    // Fixed JSON path and audio handling
    // Map page substrings to JSON filenames
    const pageToJsonMap = {
        'naxwah': 'naxwe.json',
        'tafseer': 'tafsir.json',
        'fiqh': 'fiqh.json',
        'hadith': 'hadith.json'
    };

    // Get current pathname
    const path = window.location.pathname.toLowerCase();

    // Find matching JSON filename
    let jsonFile = '/storage/naxwe.json'; // default fallback

    for (const key in pageToJsonMap) {
        if (path.includes(key)) {
            jsonFile = `/storage/${pageToJsonMap[key]}`;
            break;
        }
    }

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
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="card-image">
                <h1 class="card-name">${item.name}</h1>
                <audio src="${item.audio}"></audio>
                <progress value="0" max="100" class="progress-bar"></progress>
                <div class="audio-controls">
                    <button class="download-button" title="Download">&#128229;</button>
                    <button class="play-button" title="Play/Pause">&#9658;</button>
                    <button class="speed-button" title="Speed">1×</button>
                </div>
            `;
            container.appendChild(card);

            const audio = card.querySelector('audio');
            const progressBar = card.querySelector('.progress-bar');
            const playButton = card.querySelector('.play-button');
            const downloadButton = card.querySelector('.download-button');
            const speedButton = card.querySelector('.speed-button');

            downloadButton.addEventListener('click', () => {
                const link = document.createElement('a');
                link.href = audio.src;
                link.download = item.name + '.mp3';
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

            audio.addEventListener('timeupdate', () => {
                if (audio.duration) {
                    progressBar.value = (audio.currentTime / audio.duration) * 100;
                }
            });

            progressBar.addEventListener('click', (e) => {
                const percent = e.offsetX / progressBar.offsetWidth;
                audio.currentTime = percent * audio.duration;
            });

            playButton.addEventListener('click', () => {
                if (audio.paused) {
                    audio.play()
                        .then(() => playButton.textContent = '❚❚')
                        .catch(e => console.error("Play failed:", e));
                } else {
                    audio.pause();
                    playButton.textContent = '▶';
                }
            });
        });
    })
    .catch(error => {
        console.error(`Failed to load ${currentPage} content:`, error);
    });
});
