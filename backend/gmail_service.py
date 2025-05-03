import os
import pickle
from flask import Flask, request, jsonify, redirect
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from flask_cors import CORS

app = Flask(__name__)
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
TOKEN_PATH = "token.pickle"
CREDENTIALS_PATH = "credentials.json"  # Download from Google Cloud Console
CORS(app, origins=["http://localhost:3000"])

def get_gmail_service():
    creds = None
    if os.path.exists(TOKEN_PATH):
        with open(TOKEN_PATH, "rb") as token:
            creds = pickle.load(token)
    else:
        flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_PATH, SCOPES)
        creds = flow.run_local_server(port=0)
        with open(TOKEN_PATH, "wb") as token:
            pickle.dump(creds, token)

    return build("gmail", "v1", credentials=creds)

@app.route("/send-email", methods=["POST"])
def send_email():
    data = request.json
    recipient = data["email"]
    subject = "Your Weather Forecast"
    body = data["body"]

    service = get_gmail_service()
    message = (
        f"From: me\nTo: {recipient}\nSubject: {subject}\n\n{body}"
    ).encode("utf-8")

    import base64
    encoded_message = {"raw": base64.urlsafe_b64encode(message).decode("utf-8")}
    send_result = service.users().messages().send(userId="me", body=encoded_message).execute()

    return jsonify({"message": "Email sent!", "id": send_result["id"]})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
