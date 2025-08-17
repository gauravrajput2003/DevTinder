->npm init
->npm i express
->npm i -g nodemon
->-g here is use for global label execution
## Email delivery without SES production

If Amazon SES is denied or still in sandbox, you can enable SMTP fallback to keep sending emails (connection requests, verification, etc.).

1) Add these env vars to your `.env` on the server:

```
SMTP_HOST=smtp-relay.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="DevNexus <noreply@codeally.online>"
```

You can use providers like Brevo (smtp-relay.brevo.com), SendGrid (smtp.sendgrid.net), Mailgun, Postmark, etc.

2) Restart the backend with env updates:

```
pm2 restart devtinder-backend --update-env
```

The app will try SES first; if it fails, it automatically falls back to SMTP.
