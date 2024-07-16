document.getElementById('link-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const url = document.getElementById('url').value;
    const type = document.getElementById('type').value;
    const resultDiv = document.getElementById('result');

    try {
        const response = await fetch(`https://api.mu-jie.cc/xhs?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (data.code === 200) {
            const content = data.data;
            resultDiv.innerHTML = `
                <p><strong>Author:</strong> ${content.author}</p>
                <p><strong>UID:</strong> ${content.uid}</p>
                <p><strong>Likes:</strong> ${content.like}</p>
                <p><strong>Time:</strong> ${new Date(content.time * 1000).toLocaleString()}</p>
                <p><strong>Title:</strong> ${content.title}</p>
                <p><strong>Type:</strong> ${content.type}</p>
                <p><strong>Source URL:</strong> <a href="${content.src}" target="_blank">Link</a></p>
            `;

            if (type === 'video' && content.type === '视频') {
                resultDiv.innerHTML += `
                    <p><strong>Content URL:</strong> <a href="${content.url}" target="_blank">Link</a></p>
                    <img src="${content.cover}" alt="Cover Image" style="max-width: 100%; height: auto;">
                `;
            } else if (type === 'image' && content.type === '图文') {
                resultDiv.innerHTML += `
                    <p><strong>Cover Image:</strong></p>
                    <img src="${content.cover}" alt="Cover Image" style="max-width: 100%; height: auto;">
                    <p><strong>Images:</strong></p>
                    ${content.images.map(image => `<img src="${image}" alt="Image" style="max-width: 100%; height: auto; margin-bottom: 10px;">`).join('')}
                `;
            } else {
                resultDiv.innerHTML += `<p>Error: Content type does not match the selected type.</p>`;
            }
        } else {
            resultDiv.innerHTML = `<p>Error: ${data.msg}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    }
});
