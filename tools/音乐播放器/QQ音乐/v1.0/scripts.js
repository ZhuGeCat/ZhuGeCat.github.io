document.getElementById('search-button').addEventListener('click', function () {
    const query = document.getElementById('search-input').value;
    fetch(`https://www.hhlqilongzhu.cn/api/dg_qqmusic_SQ.php?type=json&num=60&msg=${encodeURIComponent(query)}&n=`)
        .then(response => response.json())
        .then(data => {
            const searchResults = document.getElementById('search-results');
            searchResults.innerHTML = '';

            if (data.data && data.data.length > 0) {
                data.data.forEach(song => {
                    const songDiv = document.createElement('div');
                    songDiv.classList.add('project-box');
                    songDiv.innerText = `${song.song_title} - ${song.song_singer}`;
                    songDiv.addEventListener('click', function () {
                        fetch(`https://www.hhlqilongzhu.cn/api/dg_qqmusic_SQ.php?type=json&num=60&msg=${encodeURIComponent(query)}&n=${song.n}`)
                            .then(response => response.json())
                            .then(songData => {
                                const player = document.getElementById('player');
                                const songImg = document.getElementById('song-img');
                                const songTitle = document.getElementById('song-title');
                                const songArtist = document.getElementById('song-artist');
                                const audio = document.getElementById('audio');
                                const lyricsContainer = document.getElementById('lyrics');
                                
                                player.style.display = 'block';
                                songImg.src = songData.data.cover;
                                songTitle.innerText = songData.data.song_name;
                                songArtist.innerText = songData.data.song_singer;
                                audio.src = songData.data.music_url;

                                const lyrics = parseLyrics(songData.data.lyric);
                                displayLyrics(lyrics, audio, lyricsContainer);
                            });
                    });
                    searchResults.appendChild(songDiv);
                });
            } else {
                searchResults.innerHTML = '<p>未找到相关歌曲。</p>';
            }
        });
});

function parseLyrics(lyricStr) {
    const lines = lyricStr.split('\n');
    const lyrics = [];
    const timeRegEx = /\[(\d{2}):(\d{2})\.(\d{2})\]/;

    lines.forEach(line => {
        const match = line.match(timeRegEx);
        if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseInt(match[2], 10);
            const milliseconds = parseInt(match[3], 10);
            const time = (minutes * 60 + seconds) * 1000 + milliseconds * 10;
            const text = line.replace(timeRegEx, '').trim();
            lyrics.push({ time, text });
        }
    });

    return lyrics;
}

function displayLyrics(lyrics, audio, lyricsContainer) {
    lyricsContainer.innerHTML = '';
    lyrics.forEach(lyric => {
        const p = document.createElement('p');
        p.innerText = lyric.text;
        p.dataset.time = lyric.time;
        lyricsContainer.appendChild(p);
    });

    audio.addEventListener('timeupdate', function () {
        const currentTime = audio.currentTime * 1000;
        let currentLyricIndex = 0;

        lyrics.forEach((lyric, index) => {
            if (currentTime >= lyric.time) {
                currentLyricIndex = index;
            }
        });

        const lyricsElements = lyricsContainer.getElementsByTagName('p');
        for (let i = 0; i < lyricsElements.length; i++) {
            if (i === currentLyricIndex) {
                lyricsElements[i].classList.add('current-lyric');
                lyricsElements[i].scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            } else {
                lyricsElements[i].classList.remove('current-lyric');
            }
        }
    });
}
