document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

document.getElementById('search-button').addEventListener('click', function () {
    const query = document.getElementById('search-input').value;
    fetch(`https://api.lolimi.cn/API/wydg/api.php?msg=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const results = data.data;
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';

                // 获取每首歌曲的信息
                results.forEach((song, index) => {
                    const n = index + 1; // n 是每一首歌在当前搜索关键词下的编号
                    fetch(`https://api.lolimi.cn/API/wydg/api.php?msg=${encodeURIComponent(query)}&n=${n}`)
                        .then(response => response.json())
                        .then(songData => {
                            const songDiv = document.createElement('div');
                            songDiv.className = 'project-box';
                            songDiv.innerHTML = `
                                <h2>${songData.name}</h2>
                                <p>${songData.author}</p>
                                <p>时长：${songData.market}</p>
                            `;
                            songDiv.addEventListener('click', function () {
                                document.getElementById('song-img').src = songData.img || '';
                                document.getElementById('song-title').innerText = songData.name;
                                document.getElementById('song-artist').innerText = songData.author;
                                document.getElementById('audio').src = songData.mp3; // 使用返回的音乐播放链接
                                document.getElementById('player').style.display = 'flex';

                                // 显示歌词
                                showLyrics(songData.lyric);
                            });
                            resultsContainer.appendChild(songDiv);
                        })
                        .catch(error => {
                            console.error('Error fetching song data:', error);
                        });
                });
            } else {
                alert('查询失败，请重试');
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
            alert('查询失败，请检查网络连接');
        });
});

function showLyrics(lyrics) {
    const lyricsContainer = document.getElementById('lyrics');
    lyricsContainer.innerHTML = '';

    lyrics.forEach(line => {
        const p = document.createElement('p');
        p.textContent = line.name.trim();
        lyricsContainer.appendChild(p);
    });

    // 清除之前的高亮样式
    document.querySelectorAll('#lyrics p').forEach(p => {
        p.classList.remove('current-lyric');
    });

    // 监听音频时间更新事件
    const audio = document.getElementById('audio');
    audio.addEventListener('timeupdate', function () {
        const currentTime = this.currentTime;

        // 遍历歌词，找到当前时间对应的歌词行
        for (let i = 0; i < lyrics.length; i++) {
            const lyricTime = convertTimeToSeconds(lyrics[i].time);
            if (currentTime >= lyricTime && (i === lyrics.length - 1 || currentTime < convertTimeToSeconds(lyrics[i + 1].time))) {
                // 找到当前歌词行，高亮显示
                lyricsContainer.children[i].classList.add('current-lyric');
                // 滚动到当前歌词位置
                lyricsContainer.scrollTop = lyricsContainer.children[i].offsetTop - lyricsContainer.clientHeight / 2;
            } else {
                // 其他歌词行不高亮显示
                lyricsContainer.children[i].classList.remove('current-lyric');
            }
        }
    });
}

function convertTimeToSeconds(time) {
    const parts = time.split(':');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
}
