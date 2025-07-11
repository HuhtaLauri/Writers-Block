import os
import pathlib
import sys

import requests
from flask import Flask, session, abort, redirect, request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from pip._vendor import cachecontrol
import google.auth.transport.requests
from functools import wraps
from time import sleep
import json

from flask_cors import CORS

from dotenv import load_dotenv

load_dotenv()
BACKEND_HOST = os.environ.get("BACKEND_HOST", "localhost")
FRONTEND_HOST = os.environ.get("FRONTEND_HOST", "localhost")

app = Flask("Writers Block API")
CORS(app, origins=[f"{FRONTEND_HOST}"], supports_credentials=True)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1" # to allow Http traffic for local dev

client_secrets_file = os.path.join(pathlib.Path(__file__).parent, "client_secret.json")
client_secrets = json.loads(open(client_secrets_file).read())
app.secret_key = client_secrets["web"]["client_secret"]
GOOGLE_CLIENT_ID = client_secrets["web"]["client_id"]

flow = Flow.from_client_secrets_file(
    client_secrets_file=client_secrets_file,
    scopes=[
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/documents.readonly",
    ],
    redirect_uri=f"{BACKEND_HOST}/auth/callback"
)

def login_is_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401)  # Authorization required
        else:
            return function(*args, **kwargs)

    return wrapper


@app.route("/login")
def login():
    authorization_url, state = flow.authorization_url()
    session["state"] = state
    return redirect(authorization_url)


@app.route("/auth/callback")
def callback():
    flow.fetch_token(authorization_response=request.url)
    sleep(1)

    if not session["state"] == request.args["state"]:
        abort(500)  # State does not match!

    credentials = flow.credentials
    request_session = requests.session()
    cached_session = cachecontrol.CacheControl(request_session)
    token_request = google.auth.transport.requests.Request(session=cached_session)

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=token_request,
        audience=GOOGLE_CLIENT_ID
    )

    session["google_id"] = id_info.get("sub")
    session["name"] = id_info.get("name")
    session["access_token"] = credentials.token

    return redirect(f"{FRONTEND_HOST}")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(f"{FRONTEND_HOST}")


@app.route("/")
def index():
    return "Hello World <a href='/login'><button>Login</button></a>"


@app.route("/docs")
@login_is_required
def list_documents():
    access_token = session.get("access_token")

    if not access_token:
        return abort(401)

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {
        "pageSize": 10,
        "fields": "files(id, name, mimeType, createdTime, modifiedTime, iconLink)"
    }

    response = requests.get("https://www.googleapis.com/drive/v3/files", headers=headers, params=params)

    if response.status_code != 200:
        return f"Error fetching files: {response.text}", response.status_code

    files = response.json().get("files", [])
    return {"files": files}
        

@app.route("/docs/<doc_id>")
@login_is_required
def get_document(doc_id: str):
    access_token = session.get("access_token")

    if not access_token:
        return abort(401)

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {}

    response = requests.get(f"https://docs.googleapis.com/v1/documents/{doc_id}", headers=headers, params=params)

    if response.status_code != 200:
        return f"Error fetching files: {response.text}", response.status_code

    file = response.json()
    return file

@app.route("/docs/<doc_id>/content")
@login_is_required
def get_document_content(doc_id: str):
    access_token = session.get("access_token")

    if not access_token:
        return abort(401)

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    params = {}

    response = requests.get(f"https://docs.googleapis.com/v1/documents/{doc_id}", headers=headers, params=params)

    if response.status_code != 200:
        return f"Error fetching files: {response.text}", response.status_code

    file = response.json()
    return extract_text_from_doc(file)

def extract_text_from_doc(data):
    text_parts = []

    for element in data.get("body", {}).get("content", []):
        paragraph = element.get("paragraph")
        if paragraph:
            for el in paragraph.get("elements", []):
                text_run = el.get("textRun")
                if text_run and "content" in text_run:
                    text_parts.append(text_run["content"])
    
    return "".join(text_parts)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
