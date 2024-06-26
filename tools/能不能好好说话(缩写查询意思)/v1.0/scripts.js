document.getElementById('abbreviation-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const abbreviation = document.getElementById('abbreviation-input').value;
    fetch(`https://api.pearktrue.cn/api/suoxie/?word=${encodeURIComponent(abbreviation)}`)
        .then(response => response.json())
        .then(data => {
            const abbreviationResults = document.getElementById('abbreviation-results');
            abbreviationResults.innerHTML = '';

            if (data.code === 200 && data.data.length > 0) {
                data.data.forEach(meaning => {
                    const meaningDiv = document.createElement('div');
                    meaningDiv.classList.add('project-box');
                    meaningDiv.innerText = meaning;
                    abbreviationResults.appendChild(meaningDiv);
                });
            } else {
                abbreviationResults.innerHTML = '<p>未找到相关缩写解释。</p>';
            }
        });
});
