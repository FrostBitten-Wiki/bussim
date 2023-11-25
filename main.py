from jinja2 import Template
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse



from json import load
from uvicorn import run

app = FastAPI(
    title="Bus Simulator Community Wiki Editor",
    description="FastAPI server for creating edits to the wiki.",
    docs_url=None,
    redoc_url=None
)

@app.get("/wiki/{wikipath:path}")
async def wiki(request: Request, wikipath: str = ""):
    html = open(f"./{wikipath}.html", "r")

    try:
        with open(f"./{wikipath}.json", "r") as data:
            data = load(data)
    except FileNotFoundError: data = {}

    html_template = Template(html.read())
    rendered_html = html_template.render(data)

    return HTMLResponse(content=rendered_html)

@app.get("/assets/{filepath:path}")
async def assets(filepath: str):
    return FileResponse(f"./assets/{filepath}")

if __name__ == "__main__":
    run("main:app", host="0.0.0.0", port=80, reload=True)
