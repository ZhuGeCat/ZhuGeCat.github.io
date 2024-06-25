document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

let results = []; // 存储搜索结果
let currentIndex = 0;
let isSingleLoop = true; // 初始为单曲循环

document.getElementById('search-button').addEventListener('click', function () {
    const query = document.getElementById('search-input').value;
    fetch(`https://api.lolimi.cn/API/wydg/api.php?msg=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                results = data.data;
                const resultsContainer = document.getElementById('search-results');
                resultsContainer.innerHTML = '';

                results.forEach((song, index) => {
                    const n = index + 1;
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
                                playSong(songData);
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

function playSong(songData) {
    const audio = document.getElementById('audio');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const songImg = document.getElementById('song-img');

    audio.src = songData.mp3;
    songTitle.innerText = songData.name;
    songArtist.innerText = songData.author;
    songImg.src = songData.img || '';
    document.getElementById('player').style.display = 'flex';

    if (!isSingleLoop) {
        // 播放完成后处理逻辑
        audio.addEventListener('ended', function () {
            currentIndex++;
            if (currentIndex < results.length) {
                playSong(results[currentIndex]);
            } else {
                // 播放完所有歌曲后停止播放或其他逻辑处理
                console.log('已播放完所有歌曲');
            }
        });
    } else {
        // 单曲循环模式
        audio.loop = true; // 设置循环播放
    }
}

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
                const offsetTop = lyricsContainer.children[i].offsetTop - lyricsContainer.offsetTop;
                const containerHeight = lyricsContainer.clientHeight;
                const lineHeight = lyricsContainer.children[i].offsetHeight;
                const scrollTo = offsetTop - (containerHeight / 2 - lineHeight / 2);
                lyricsContainer.scrollTo({ top: scrollTo, behavior: 'smooth' });
            } else {
                // 其他歌词行不高亮显示
                lyricsContainer.children[i].classList.remove('current-lyric');
            }
        }
    });

    // 初始化时将第一行歌词置于中心
    if (lyrics.length > 0) {
        const firstLineOffsetTop = lyricsContainer.children[0].offsetTop - lyricsContainer.offsetTop;
        const firstLineHeight = lyricsContainer.children[0].offsetHeight;
        const initialScrollTo = firstLineOffsetTop - (lyricsContainer.clientHeight / 2 - firstLineHeight / 2);
        lyricsContainer.scrollTo({ top: initialScrollTo, behavior: 'auto' });
    }
}


// 辅助函数：将时间字符串转换为秒数
function convertTimeToSeconds(timeString) {
    const [minutes, seconds] = timeString.split(':').map(parseFloat);
    return minutes * 60 + seconds;
}
