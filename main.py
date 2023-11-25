from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import FileResponse

from json import load
from uvicorn import run

app = FastAPI(
    title="Bus Simulator Community Wiki Editor",
    description="FastAPI server for creating edits to the wiki.",
    docs_url=None,
    redoc_url=None
)

templates = Jinja2Templates(directory="./")


@app.get("/wiki/{wikipath:path}")
async def wiki(request: Request, wikipath: str = ""):
    try:
        with open(f"./{wikipath}.json", "r") as data:
            data = load(data)
    except FileNotFoundError: data = {}

    return templates.TemplateResponse(f"{wikipath}.html", {"request": request, "data": data})

@app.get("/assets/{filepath:path}")
async def assets(filepath: str):
    return FileResponse(f"./assets/{filepath}")

if __name__ == "__main__":
    run("main:app", host="0.0.0.0", port=80, reload=True)
