# This python file is used for live-editing the wiki locally.
# If you have python installed, you can also use this to make edits and see changes easily without waiting for github's cache.

# Copy this to install required libraries:
# pip install fastapi uvicorn PyYAML jinja2

from jinja2 import Template
from yaml import load, FullLoader
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from uvicorn import run

app = FastAPI(
    docs_url=None,
    redoc_url=None
)

template = Jinja2Templates("./")
#app.mount("/bussim-assets", StaticFiles(directory="./assets"), name="assets")

@app.get("/bussim/{wikipath:path}")
async def wiki(request: Request, wikipath: str = ""):
    if wikipath == "": wikipath = "home"
    html = open(f"./desktop.html", "r")

    try:
        with open(f"./pagedata/{wikipath}.yaml", "r") as file:
            data = load(file, Loader=FullLoader)
    except FileNotFoundError: data = ""
    except Exception as e:
        return e

    html_template = Template(html.read())
    rendered_html = html_template.render(data)

    return HTMLResponse(content=rendered_html)

@app.get("/bussim-assets/{file:path}")
async def assets(request: Request, file: str):
    if not file.endswith("json"):
        return FileResponse(f"./assets/{file}", headers={"Cache-Control": f"public, max-age=43200"}) # same wikiserver max-age time. press CTRL + SHIFT + R to reload
    else:
        return FileResponse(f"./assets/{file}")

if __name__ == "__main__":
    run("main:app", host="0.0.0.0", port=80, reload=True)
