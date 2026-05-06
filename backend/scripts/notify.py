import os
import smtplib
from email.message import EmailMessage
import requests
from typing import Optional


def send_slack_webhook(message: str) -> bool:
    url = os.getenv("SLACK_WEBHOOK_URL")
    if not url:
        return False
    try:
        payload = {"text": message}
        resp = requests.post(url, json=payload, timeout=10)
        return resp.ok
    except Exception:
        return False


def send_email(subject: str, body: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    to_addrs = os.getenv("ALERT_EMAIL_TO")
    from_addr = os.getenv("ALERT_EMAIL_FROM", smtp_user)

    if not smtp_host or not to_addrs:
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to_addrs
    msg.set_content(body)

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as smtp:
            smtp.starttls()
            if smtp_user and smtp_pass:
                smtp.login(smtp_user, smtp_pass)
            smtp.send_message(msg)
        return True
    except Exception:
        return False


def notify_on_failure(message: str) -> None:
    # Try Slack first, then email
    slack_ok = send_slack_webhook(message)
    email_ok = send_email("MUA Vault - Data Export Failure", message)
    # We don't raise on failure to avoid masking original errors


def notify_on_success(message: str) -> None:
    # Optional: send only if env var set
    notify_on_success_flag = os.getenv("ALERT_ON_SUCCESS", "false").lower() == "true"
    if not notify_on_success_flag:
        return
    send_slack_webhook(message)
    send_email("MUA Vault - Data Export Success", message)
