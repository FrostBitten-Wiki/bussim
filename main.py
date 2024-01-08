from jinja2 import Template

from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse, Response, JSONResponse

from httpx import get
from uvicorn import run
from yaml import load, safe_load, SafeLoader

import jinki
import re

import os

app = FastAPI(
    docs_url=None,
    redoc_url=None
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="./core/pages")
assetServer = "https://frostbitten-wiki.github.io/"
searchData = {}

class PostProcessors:
    @staticmethod
    def section(match):
        level = len(match.group(1))
        title = match.group(2)

        fontSize = {1: "35px", 2: "25px", 3: "20px"}.get(level, "25px")
        sep = ""
        if level != 3: sep = "<div style=\"width: 100%; height: 1px; background-color: white; margin-top: 2px; margin-bottom: 5px; box-shadow: 0 2px 0 #000000;\"></div>"
        
        return f"""
<div style="margin-top: 20px;" id="{title.lower().replace(" ", "-")}">
    <text style="font-size: {fontSize};">{title}</text>
    {sep}
</div>
"""
    
    @staticmethod
    def quote(match):
        quote = match.group(1)
        author = match.group(2)

        return f"""
<div style="margin-top: 20px; margin-bottom: 30px">
    <div style="display: grid; grid-template-columns: 0.05fr 1fr 0.05fr;">
        <text style="font-size: 50px;">"</text>
        <text style="text-align: center;">{quote}</text>
        <text style="font-size: 50px; text-align: right;">"</text>
    </div><br>
    <text>- {author}</text>
</div>
"""
    
    @staticmethod
    def dialogueEmulator(match):
        emulatorId = match.group(1)
        startId = match.group(2)
        datasetURL = match.group(3)

        return f"""
<div style="margin-top: 20px; margin-bottom: 30px">
    <div id="{emulatorId}-dialogue" class="checkBg" style="margin-bottom: 5px; padding: 10px; --color1: grey; --color2: white; --color3: grey; width: calc(100% - 28px); height: 150px;" onclick="window.{emulatorId}dialogueDelay = 5">
        <text id="{emulatorId}-name" style="font-size: 20px;"></text><br>
        <text id="{emulatorId}-chat"></text>
    </div>

    <text id="{emulatorId}-note" style="margin-top: 5px; margin-bottom: 10px;"></text>

    <div id="{emulatorId}-choices" style="padding: 0; gap: 0 5px;  display: flex; justify-content: space-between; align-items: center;">
    </div>

    <div id="{emulatorId}-controls" style="padding: 0; gap: 0 5px;  display: flex; justify-content: space-between; align-items: center;">
    </div>

    <script defer>
        var {emulatorId}chatDataset;
        var {emulatorId}dialogueDelay = 25;

        document.addEventListener('DOMContentLoaded', function() {{
            fetch("{datasetURL}")
            .then(response => response.json())
            .then(data => {{
                console.log(data);
                {emulatorId}chatDataset = data;
                console.log("dataset append -> {emulatorId}");
                changeDialogue("{emulatorId}", "{startId}");
            }})
            .catch(error => {{
                document.getElementById("{emulatorId}-name").innerText = "Emulator Error";
                document.getElementById("{emulatorId}-dialogue").style.setProperty("--color1", "#190000");
                document.getElementById("{emulatorId}-dialogue").style.setProperty("--color2", "#260000");
                document.getElementById("{emulatorId}-dialogue").style.setProperty("--color3", "red");
                document.getElementById("{emulatorId}-chat").innerHTML = "The server could not load the Dialogue Dataset. Please refresh the page!<br><br>If this error persists, please check if the dataset is in the correct path with a correct filename. or if the Start ID is configured to the correct StartID on the dataset.";
            }});
        }});
    </script>
<div>
"""

    @staticmethod
    def gallery(match):
        urls = match.group(1).split("|")
        imageList = ""

        for image in urls:
            imageList += f'        <img src="{image}" style="cursor: pointer; object-fit: contain;" onclick="previewImage(this)" alt="Open Image" loading="lazy">\n'

        return f"""
<div style="margin-top: 20px; margin-bottom: 30px" id="gallery">
    <text style="font-size: 25px;">Gallery</text>
    <div class="gallery-container" style="margin-bottom: 20px;">
        <div class="gallery" style="padding: 10px;">
    {imageList}
        </div>
    </div>
</div>
"""
        
    @staticmethod
    def listItem(match):
        image = match.group(1)
        title = match.group(2)
        desc = match.group(3)
        redir = match.group(4)

        if redir == "":
            if image == "":
                return f"""
<div class="container" style="padding: 10px;">
    <text style="font-size: 25px;">{title}</text><br>
    <text>{desc}</text>
</div>
"""
            else:
                return f"""
<div class="container" style="padding: 10px; display: grid; grid-template-columns: 128px 1fr; gap: 10px;">
    <img src="{image}" height="128" width="128" style="object-fit: cover;" loading="lazy">

    <div>
        <text style="font-size: 25px;">{title}</text><br>
        <text>{desc}</text>
    </div>
</div>
"""
        else:
            if image == "":
                return f"""
<a href="{redir}">
<div class="container" style="padding: 10px; cursor: pointer;">
    <text style="font-size: 25px;">{title}</text><br>
    <text>{desc}</text>
</div>
</a>
"""
            else:
                return f"""
<a href="{redir}">
<div class="container" style="padding: 10px; cursor: pointer; display: grid; grid-template-columns: 128px 1fr; gap: 10px;">
    <img src="{image}" height="128" width="128" style="object-fit: cover;" loading="lazy">

    <div>
        <text style="font-size: 25px;">{title}</text><br>
        <text>{desc}</text>
    </div>
</div>
</a>
"""
    
    @staticmethod
    def buttons(match):
        buttons = match.group(1).split("|")
        
        buttonList = ""
        for button in buttons:
            button = button.split(",")
            buttonList += f"""
<button style="flex: auto;" onclick="{button[1]}">
    <text type="hoverText">{button[0]}</text>
</button>\n
"""
        
        return f"""
<div style="margin-top: 20px; margin-bottom: 30px">
    <div style="padding: 0; gap: 0 5px;  display: flex; justify-content: space-between; align-items: center;">
        {buttonList}
    </div>
</div>
"""

    @staticmethod
    def infobox(match):
        title = match.group(1)
        color = match.group(2)
        text = match.group(3).replace("\"", "&quot;")

        return f"""
<div style="margin-top: 20px; padding: 10px;" class="container">
    <text style="color: {color}; font-size: 25px;">{title}</text><br>
    <text>{text}</text>
</div>
"""

    @staticmethod
    def image(match):
        width, height = match.group(1).split("x")
        image = match.group(2)

        return f'<img src="{image}" width="{width}" height="{height}">'


@app.get("/")
async def siteHome():
    return "Available Wiki: https://wiki.wolfdo.gg/wiki/bussim/"

@app.get("/wiki/{repo}/{page}")
async def wiki(request: Request, repo: str, page: str):
    if page == "": page = "home"
    templateHTML = open("template.html", "r").read()
    #templateData = open(f"./pagedata/{file.rstrip("/")}.yaml", "r").read()

    def findFile(folder_path, file_name):
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                if file == file_name:
                    return os.path.join(root, file_name)
        return None

    templateData = open(findFile('./pagedata', f'{page}.yaml'), "r").read()
    templateData = load(templateData, Loader=SafeLoader)
    templateData["content"] = jinki.render(templateData["content"], syntaxes)
    templateData["page"]["header"]["description"] = jinki.render(templateData["page"]["header"]["description"], syntaxes)

    html_template = Template(templateHTML)
    rendered_html = html_template.render(templateData)
    
    return HTMLResponse(rendered_html)

# Jinki Rendering API
synpat = jinki.Patterns()

syntaxes = {
    "comment": (r"\#\!\[(.*?)\]", None, ""),
    "newline": (r"\\n", None, "<br>"),
    "escapechar": (synpat.HTML_CHAR[0], None, synpat.HTML_CHAR[1]),

    # Custom HTML Syntaxes
    "dialogueEmulator": (r'!!DLEMULATOR EID:"(.*?)" SID:"(.*?)" URL:"(.*?)"', None, PostProcessors.dialogueEmulator),
    "infoBox": (r'!!INFOBOX TITLE:"(.*?)" COLOR:"(.*?)" TEXT:"(.*?)"', None, PostProcessors.infobox),
    "gallery": (r'!!GALLERY \[(.*?)\]', None, PostProcessors.gallery),
    "buttons": (r'!!BUTTONS \[(.*?)\]', None, PostProcessors.buttons),
    "section": (r'(#+)\[(.*?)\]', None, PostProcessors.section),
    "quote": (r'"(.*?)" -"(.*?)"', None, PostProcessors.quote),
    "listContainer": (r'!!LISTITEM IMAGE:"(.*?)" TITLE:"(.*?)" DESCRIPTION:"(.*?)" REDIRECT:"(.*?)"', None, PostProcessors.listItem),

    "gridContainerStart": (r'!!GRID:START COLUMNS:"(.*?)" ROWS:"(.*?)"', None, r'<div class="contentGrid" style="display: grid; grid-template-columns: \1; grid-template-rows: \2; gap: 5px;">'),
    "gridContentcontainerStart": (r'!!CONTAINER:START', None, r'<div>'),
    "gridContentcontainerEnd": (r'!!CONTAINER:END', None, r'</div>'),
    "gridContainerEnd": (r'!!GRID:END', None, r'</div>'),
    
    # Custom Text Syntaxes
    "fontColor": (r'\<clr:(.*?)\>\((.*?)\)', None, r'<text style="color: \1;">\2</text>'),
    "fontSize": (r'\<(\d+)px\>\((.*?)\)', None, r'<text style="font-size: \1px;">\2</text>'),
    "highlightRainbow": (r'hr\[(.*?)\]', None, r'<highlight type="rainbow">\1</highlight>'),
    "highlightGrey": (r'hg\[(.*?)\]', None, r'<highlight type="grey">\1</highlight>'),
    "highlight": (r'h\[(.*?)\]', None, r'<highlight>\1</highlight>'),

    # Text Syntaxes
    "image": (r"!\[([^\]]+)\]\(([^)]+)\)", None, PostProcessors.image),
    "underline": (synpat.UNDERLINE[0], None, synpat.UNDERLINE[1]),
    "italic": (synpat.ITALIC[0], None, synpat.ITALIC[1]),
    "strike": (synpat.STRIKE[0], None, synpat.STRIKE[1]),
    "link": (synpat.LINK[0], None, synpat.LINK[1]),
    "bold": (synpat.BOLD[0], None, synpat.BOLD[1]),
    "sub": (synpat.SUB[0], None, synpat.SUB[1]),
    "sup": (synpat.SUP[0], None, synpat.SUP[1]),
    
    # Markdown Syntaxes
    "table": (synpat.TABLE[0], re.MULTILINE | re.DOTALL, synpat.TABLE[1]),
    "tree": (synpat.TREE[0], re.MULTILINE, synpat.TREE[1]),
}
    
# Asset Delivery
@app.get("/{repo}-assets/{file:path}") # for backwards-compatibility
@app.get("/assets/{repo}/{file:path}")
async def assetDelivery(request: Request, repo: str, file: str):
    return FileResponse(f"./assets/{file}")

if __name__ == "__main__":
    run("main:app", host="0.0.0.0", port=8080, reload=True)
