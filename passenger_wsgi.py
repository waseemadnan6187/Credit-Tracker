
import os
import sys

# Add your application directory to the sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Import the FastAPI app
from main import app

# Create a function compatible with Phusion Passenger
def application(environ, start_response):
    # This is a basic wrapper, for production use a specific bridge if needed
    # but most Hostinger setups can use the FastAPI app directly via Uvicorn/Gunicorn
    return app(environ, start_response)
