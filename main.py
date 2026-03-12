
import json
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI()

# Enable CORS for the frontend React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "ledger_data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"bills": [], "recoveries": [], "customers": [], "obs": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@app.get("/")
async def root():
    return {"status": "BillTrack Pro API Active"}

@app.get("/sync")
async def pull_data():
    return load_data()

@app.post("/sync")
async def push_data(request: Request):
    try:
        data = await request.json()
        if "test" in data:
            return {"status": "connection_test_success"}
        save_data(data)
        return {"status": "success"}
    except Exception as e:
        return JSONResponse(status_code=400, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
