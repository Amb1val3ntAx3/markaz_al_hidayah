document.addEventListener('DOMContentLoaded', function() {
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
    // Detect which page we're on (naxwah or tafseer)
    const currentPage = window.location.pathname.includes('naxwah') ? 'naxwe' : 
                       window.location.pathname.includes('tafseer') ? 'tafsir' : 
                       'naxwe'; // default fallback
    
    const jsonFile = `/storage/${currentPage}.json`;
    
    fetch(jsonFile)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        const container = document.getElementById('cardFolder');
        if (!container) return;
        
        container.innerHTML = ''; // Clear previous cards
        
        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('item');
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="card-image">
                <h1 class="card-name">${item.name}</h1>
                <audio src="${item.audio}"></audio>
                <progress value="0" max="100" class="progress-bar"></progress>
                <p class="play-button">&#9658;</p>
            `;
            container.appendChild(card);

            // Audio controls setup
            const audio = card.querySelector('audio');
            const progressBar = card.querySelector('.progress-bar');
            const playButton = card.querySelector('.play-button');

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
        // Optional: Display error message to user
    });
});