document.getElementById('query-button').addEventListener('click', function () {
    const trackingNumber = document.getElementById('tracking-number').value;
    const phoneLast4 = document.getElementById('phone-last-4').value;

    if (!trackingNumber) {
        alert('请输入快递单号');
        return;
    }

    let apiUrl = `https://api.songzixian.com/api/express-tracking?dataSource=nationwide_express&trackingNumber=${encodeURIComponent(trackingNumber)}`;
    
    if (phoneLast4) {
        apiUrl += `&phoneLast4=${encodeURIComponent(phoneLast4)}`;
    }

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const resultsContainer = document.getElementById('tracking-results');
            resultsContainer.innerHTML = '';

            if (data.code === 200) {
                const trackingDetails = data.data.trackingDetails;

                trackingDetails.forEach(detail => {
                    const entryDiv = document.createElement('div');
                    entryDiv.className = 'project-box';
                    entryDiv.innerHTML = `
                        <h2>${detail.time}</h2>
                        <p>${detail.description}</p>
                    `;
                    resultsContainer.appendChild(entryDiv);
                });
            } else {
                resultsContainer.innerHTML = '<p>查询失败，请检查单号是否正确。</p>';
            }
        })
        .catch(error => {
            console.error('查询失败:', error);
            alert('查询失败，请检查网络连接');
        });
});
