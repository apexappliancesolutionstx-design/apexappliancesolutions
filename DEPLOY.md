# Deploying to a Hostinger VPS

The app runs as a single Node process (`server.js`) that serves the built site
**and** the secured `/api/lead` endpoint. nginx sits in front to terminate HTTPS
and proxy to Node. PM2 keeps the Node process alive and restarts it on reboot.

> On a VPS the in-memory rate-limiting / idempotency in `api/lead.js` work
> correctly because it's one long-running process (unlike serverless).

## 0. Prerequisites
- A Hostinger **VPS** (Ubuntu recommended) with root/SSH access.
- A domain pointed at the VPS IP (an `A` record → your VPS IPv4).
- A [Resend](https://resend.com) account + verified sending domain (for lead email).

## 1. Install Node.js 20+ and PM2
```bash
ssh root@YOUR_VPS_IP
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git nginx
npm install -g pm2
node -v   # confirm v20+ (this project is tested on 20/24)
```

## 2. Get the code and build
```bash
cd /var/www
git clone https://github.com/apexappliancesolutionstx-design/apexappliancesolutions.git apex
cd apex
npm install          # installs deps (incl. build tools)
npm run build        # produces dist/
```

## 3. Configure environment (lead email)
Create `/var/www/apex/.env` (never committed):
```bash
cat > .env <<'EOF'
PORT=3000
RESEND_API_KEY=re_your_key_here
LEAD_NOTIFY_TO=owner@apexappliancesolutions.com
LEAD_NOTIFY_FROM=Apex Leads <leads@apexappliancesolutions.com>
EOF
```
> Without these, the form still works but the email is skipped and the lead is
> only logged — so set them before going live.

## 4. Start with PM2
```bash
pm2 start npm --name apex -- start    # runs "npm start" → node server.js
pm2 save                              # remember the process list
pm2 startup                           # print a command to enable boot-start; run it
```
Check it: `curl http://127.0.0.1:3000/` should return HTML.

## 5. nginx reverse proxy
Create `/etc/nginx/sites-available/apex`:
```nginx
server {
    listen 80;
    server_name apexappliancesolutions.com www.apexappliancesolutions.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
`X-Forwarded-For` is what the per-IP throttle reads — keep that header line.

```bash
ln -s /etc/nginx/sites-available/apex /etc/nginx/sites-enabled/apex
nginx -t && systemctl reload nginx
```

## 6. HTTPS (free, automatic)
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d apexappliancesolutions.com -d www.apexappliancesolutions.com
```
Certbot edits the nginx config for TLS and auto-renews.

## Updating the site later
```bash
cd /var/www/apex
git pull
npm install
npm run build
pm2 restart apex
```

## Pre-launch checklist (still placeholders in the code)
- [ ] Real phone number (currently `(512) 555-0142`) in header, hero, contact, footer.
- [ ] Real domain in `index.html` (`<title>`, meta description, canonical) and the
      JSON-LD schema comment in `src/ApexApplianceSolutions.jsx`.
- [ ] Uncomment + paste the JSON-LD `LocalBusiness` schema into the page `<head>`.
- [ ] Resend domain verified and the three env vars set on the VPS.
