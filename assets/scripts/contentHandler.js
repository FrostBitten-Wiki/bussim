function renderHTML(url) {
    document.getElementById('loadScreen').style.display = "block";
    document.getElementById('loadScreenText').style.display = "flex";
    document.getElementById('loadScreen').style.opacity = 1;

    fetch(url.replace("wiki", "api/jinki"))
        .then(response => {
            if (!response.ok) {
                console.log("nope");
                setTimeout(function () {
                    document.getElementById('loadScreen').style.opacity = 0;
                }, 500)
                setTimeout(function () {
                    document.getElementById('loadScreen').style.display = "none";
                    document.getElementById('loadScreenText').style.display = "none";
                }, 1500)
                
                throw new Error('you GYATT to see this error.... the server was not okay being rizzed.... (Server Response not OK.)');
            } else {
                console.log("ya");
                var title = document.getElementById('title');
                var description = document.getElementById('description');
                title.innerHTML = '';
                description.innerHTML = '';
                document.getElementById('wikiContent').innerHTML = '';
                return response.text();
            }
        })
        .then(htmlContent => {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;

            var scripts = tempDiv.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var script = document.createElement('script');
                script.text = scripts[i].text;
                document.head.appendChild(script).parentNode.removeChild(script);
            }
            

            // set title and description and other stuff
            fetch(url.replace("wiki", "contentinfo"))
            .then(response => response.text())
            .then(data => {
                const jsonData = JSON.parse(data)
                
                const bannerImage = document.getElementById('bannerImage');
                const attributions = document.getElementById('attributions');

                title.innerHTML = jsonData.header.title;
                description.innerHTML = jsonData.header.description;
                bannerImage.src = jsonData.header.banner;

                attributions.innerHTML = '';
                jsonData.attributions.forEach(item => {
                    const textElement = document.createElement('text')
                    const lineBreak = document.createElement('br');
                    textElement.innerHTML = item;
                    textElement.style.fontSize = "10px";
                    attributions.appendChild(textElement);
                    attributions.appendChild(lineBreak);
                });
                window.document.title = `Bus Simulator: ${jsonData.header.title}`
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
            
            window.history.pushState({}, null, url.replace("api/jinki", "wiki"));
            document.getElementById('wikiContent').innerHTML = tempDiv.innerHTML;

            setTimeout(function () {
                document.getElementById('loadScreen').style.opacity = 0;
            }, 500)
            setTimeout(function () {
                document.getElementById('loadScreen').style.display = "none";
                document.getElementById('loadScreenText').style.display = "none";
            }, 1500)
        })
        .catch(error => {
            console.error('Error Rendering HTML:', error);
        });
}


function renderContent() {
    renderHTML(window.location.pathname);
    console.log("change: " + window.location.pathname);
}

window.addEventListener('popstate', renderContent) // handle history change
window.addEventListener('load', renderContent) // initial load
