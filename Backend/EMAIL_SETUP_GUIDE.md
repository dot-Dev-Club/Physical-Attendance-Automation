# Email Setup Guide for Gmail

## Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "How you sign in to Google", enable **2-Step Verification** if not already enabled
4. After 2-Step Verification is enabled, go back to Security
5. Under "How you sign in to Google", click on **App passwords**
6. Select **Mail** as the app and **Other** as the device
7. Enter "Django Attendance System" as the device name
8. Click **Generate**
9. **Copy the 16-character password** (you won't see it again!)

## Step 2: Update .env File

Open `Backend/.env` and update these lines:

```env
# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-actual-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
DEFAULT_FROM_EMAIL=your-actual-email@gmail.com
```

**Replace:**
- `your-actual-email@gmail.com` with the HOD's Gmail address
- `your-16-char-app-password` with the app password from Step 1

## Step 3: Test Email

After updating the `.env` file, restart the Django server:

```powershell
cd Backend
.\.venv\Scripts\python.exe manage.py runserver
```

## Important Notes:

- **Never commit the .env file to git** (it's already in .gitignore)
- Each HOD should use their own email credentials
- The email will be sent FROM the HOD's email address to the period faculty
- For development/testing, you can use `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` which prints emails to console instead of sending them

## Email Flow:

1. Student submits attendance request → Status: PENDING_MENTOR
2. Mentor approves → Status: PENDING_HOD
3. **HOD approves → Status: APPROVED → 📧 Email sent to all period faculty from HOD's email**
4. Faculty receives email with student details and their specific periods

## Troubleshooting:

### "SMTP AUTH extension not supported"
- Make sure 2-Step Verification is enabled
- Make sure you're using App Password, not your regular Gmail password

### "Username and Password not accepted"
- Double-check the email and app password in .env
- Remove any spaces from the app password
- Make sure you're using the full email address

### Emails not sending
- Check the Django console for error messages
- Verify your internet connection
- Check Gmail's "Sent" folder to confirm