setInterval(() => {
    document.querySelectorAll("float").forEach(el => {
        if(el.getAttribute("processed") != "true") {
            el.setAttribute("processed", "true")
            el.style.fontSize = "inherit"

            const string = el.innerHTML
            const nodeName = el.nodeName
            const matchedTags = string.match(/<[^>]*>/g)
            const textArray = string.split("")
            let processedString = ""
            let ignore = []
            let offset = 0
        
            for(i in textArray) {
                let extraStyles = ""
        
                for(ii in matchedTags) {
                    if(i == string.indexOf(matchedTags[ii])) {
                        console.log(i)
                        processedString += matchedTags[ii]
                        for(i3 in [...Array(matchedTags[ii].length).keys()]) {
                            ignore.push(string.indexOf(matchedTags[ii]) + parseInt(i3))
                        }
                    }
                }
        
                if(textArray[i] == " ") {
                    extraStyles += "margin-right: 5px;"
                }
        
                if(!ignore.includes(parseInt(i))) {
                    processedString += `<${nodeName}-child style='display: inline-block; overflow: hidden; font-size: inherit; animation: wave 1s ease-in-out infinite; animation-delay: ${offset}ms; ${extraStyles}'>${textArray[i]}</${nodeName}-child>`
                    offset += 75
                }
            }
        
            console.log(processedString)
            console.log(ignore)
            console.log(string)
            el.innerHTML = processedString
        }
    })
}, 1333)