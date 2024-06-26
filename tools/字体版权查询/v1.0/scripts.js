document.getElementById('font-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const fontName = document.getElementById('font-input').value;
    fetch(`https://api.pearktrue.cn/api/font/copyright.php?font=${encodeURIComponent(fontName)}`)
        .then(response => response.json())
        .then(data => {
            const fontResults = document.getElementById('font-results');
            fontResults.innerHTML = '';

            if (data.code === 200 && data.data.length > 0) {
                data.data.forEach(font => {
                    const fontDiv = document.createElement('div');
                    fontDiv.classList.add('project-box');
                    fontDiv.innerHTML = `
                        <p>中文名称：${font.cn_name}</p>
                        <p>英文名称：${font.ec_name}</p>
                        <p>版权信息：${font.is_pay}</p>
                    `;
                    fontResults.appendChild(fontDiv);
                });
            } else {
                fontResults.innerHTML = '<p>未找到相关字体版权信息。</p>';
            }
        });
});
