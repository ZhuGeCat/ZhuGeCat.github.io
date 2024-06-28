document.getElementById('signatureForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const word = document.getElementById('word').value;
    const type = document.getElementById('type').value;
    const size = document.getElementById('size').value;
    
    const signatureOutput = document.getElementById('signatureOutput');
    const apiUrl = `https://api.pearktrue.cn/api/signature/?word=${encodeURIComponent(word)}&type=${type}&size=${size}&fontcolor=#ffffff&colors=#FD5668`;

    fetch(apiUrl)
        .then(response => response.blob())
        .then(blob => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.alt = "结果";
            signatureOutput.innerHTML = '';
            signatureOutput.appendChild(img);
        })
        .catch(error => {
            console.error('Error:', error);
            signatureOutput.textContent = '生成失败...';
        });
});
