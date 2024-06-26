document.getElementById('search-button').addEventListener('click', function () {
    const query = document.getElementById('search-input').value;
    fetch(`https://www.hhlqilongzhu.cn/api/dg_kgmusic.php?type=json&num=10000&gm=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.data && data.data.length > 0) {
                const results = data.data;
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';

                results.forEach(song => {
                    const songDiv = document.createElement('div');
                    songDiv.className = 'project-box';
                    songDiv.innerHTML = `
                        <h2>${song.title}</h2>
                        <p>${song.singer}</p>
                    `;
                    songDiv.addEventListener('click', function () {
                        fetch(`https://www.hhlqilongzhu.cn/api/dg_kgmusic.php?type=json&num=10000&gm=${encodeURIComponent(query)}&n=${song.n}`)
                            .then(response => response.json())
                            .then(songData => {
                                document.getElementById('song-img').src = songData.cover;
                                document.getElementById('song-title').innerText = songData.title;
                                document.getElementById('song-artist').innerText = songData.singer;
                                document.getElementById('audio').src = songData.music_url;
                                document.getElementById('player').style.display = 'flex';

                                const audio = document.getElementById('audio');
                                const lyricsContainer = document.getElementById('lyrics');
                                lyricsContainer.innerHTML = '';
                                const lyrics = [];
                                if (songData.lyrics) {
                                    const lines = songData.lyrics.split('\n');
                                    lines.forEach(line => {
                                        const timeMatch = line.match(/\[(\d{2}:\d{2}.\d{2})\]/);
                                        const text = line.replace(/\[.*?\]/g, '').trim();
                                        if (timeMatch && text) {
                                            const time = timeMatch[1].split(':');
                                            const seconds = parseInt(time[0]) * 60 + parseFloat(time[1]);
                                            lyrics.push({ time: seconds, text: text });
                                            lyricsContainer.innerHTML += `<p data-time="${seconds}">${text}</p>`;
                                        }
                                    });
                                }

                                audio.addEventListener('timeupdate', function () {
                                    const currentTime = audio.currentTime;
                                    let currentLyricIndex = -1;

                                    lyrics.forEach((lyric, index) => {
                                        if (currentTime >= lyric.time) {
                                            currentLyricIndex = index;
                                        }
                                    });

                                    if (currentLyricIndex !== -1) {
                                        const currentLyric = lyricsContainer.querySelector(`[data-time="${lyrics[currentLyricIndex].time}"]`);
                                        const previousLyric = lyricsContainer.querySelector('.current-lyric');
                                        if (previousLyric) {
                                            previousLyric.classList.remove('current-lyric');
                                            previousLyric.style.fontWeight = 'normal';
                                            previousLyric.style.color = 'black';
                                        }
                                        currentLyric.classList.add('current-lyric');
                                        currentLyric.style.fontWeight = 'bold';
                                        currentLyric.style.color = 'blue';
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Error fetching song data:', error);
                            });
                    });
                    resultsContainer.appendChild(songDiv);
                });
            } else {
                alert('未找到相关歌曲');
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            alert('查询失败，请检查网络连接');
        });
});
