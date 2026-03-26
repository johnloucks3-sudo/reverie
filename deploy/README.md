# REVERIE Deployment Guide

REVERIE is a three-layer system:
- **Layer 1:** Cloudflare Pages (React/Vite PWA) → `app.d2mluxury.quest`
- **Layer 2:** Hetzner CX21 (FastAPI) → `api-reverie.d2mluxury.quest`
- **Layer 3:** YOGA (Thunderbird MCP) → `api.d2mluxury.quest`

## First-Time VPS Setup

### 1. Provision Hetzner CX21 (Debian 12)

```bash
# On your local machine or YOGA
scp deploy/vps_setup.sh root@YOUR_VPS_IP:/tmp/
ssh root@YOUR_VPS_IP bash /tmp/vps_setup.sh
```

The script will:
- Install Python 3.11, nginx, certbot
- Create `/opt/reverie-api` with venv
- Configure systemd service and nginx reverse proxy
- Enable and start nginx

### 2. Configure Secrets

Generate a fresh JWT secret:
```bash
openssl rand -hex 32
```

Copy `.env.example` to the VPS and fill in real values:
```bash
scp api/.env.example root@YOUR_VPS_IP:/opt/reverie-api/.env
ssh root@YOUR_VPS_IP "nano /opt/reverie-api/.env"
```

Required secrets:
- `SECRET_KEY`: JWT signing key (from `openssl rand -hex 32`)
- `SMTP_PASSWORD`: Gmail app password for d2mconcierge
- `THUNDERBIRD_API_KEY`: API key for Thunderbird MCP integration

### 3. Set Up TLS

```bash
ssh root@YOUR_VPS_IP
certbot --nginx -d api-reverie.d2mluxury.quest
```

Certbot will auto-update nginx config with HTTPS.

## Deploy API Updates

After code changes, redeploy to VPS:

```bash
export VPS_HOST=root@api-reverie.d2mluxury.quest
./deploy/deploy_api.sh
```

The script will:
- rsync code to `/opt/reverie-api` (excludes `.venv`, `.env`, `__pycache__`)
- Activate venv and install dependencies
- Restart systemd service
- Print status and recent logs

### Monitoring

```bash
# SSH to VPS
ssh root@YOUR_VPS_IP

# Check service status
systemctl status reverie-api

# View live logs
journalctl -u reverie-api -f

# Restart manually
systemctl restart reverie-api
```

## Deploy Frontend

Frontend (React/Vite) is deployed via **Cloudflare Pages** — no manual build step.

### GitHub Integration

1. Connect repo to Cloudflare Pages
2. Set build configuration:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `client/`

### Auto-Deploy

Every push to `main` branch triggers:
- `npm ci && npm run build` in `client/` directory
- Upload of `dist/` to Cloudflare Edge

### Manual Deploy (Local Build Test)

```bash
cd client/
npm run build
# Output: dist/
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│ REVERIE User (Browser)                              │
├─────────────────────────────────────────────────────┤
│ app.d2mluxury.quest (Cloudflare Pages)              │
│ ├─ React 19 + Vite                                  │
│ ├─ Tailwind CSS                                     │
│ ├─ Service Worker (Workbox)                         │
│ └─ React Query (API calls)                          │
└────────────┬────────────────────────────────────────┘
             │ HTTP/2 (TLS)
┌────────────▼────────────────────────────────────────┐
│ api-reverie.d2mluxury.quest (Hetzner CX21)          │
├─────────────────────────────────────────────────────┤
│ nginx (reverse proxy, TLS termination)              │
│ ↓                                                   │
│ FastAPI (uvicorn, 127.0.0.1:8000)                  │
│ ├─ Auth (magic link + JWT)                          │
│ ├─ Trip queries (proxy to YOGA)                      │
│ └─ Notification emails (via d2mconcierge SMTP)      │
└────────────┬────────────────────────────────────────┘
             │ SSE + HTTP
┌────────────▼────────────────────────────────────────┐
│ api.d2mluxury.quest (YOGA — 192.168.1.198)         │
├─────────────────────────────────────────────────────┤
│ Thunderbird MCP (120+ tools)                        │
│ ├─ Trip/Booking data                                │
│ ├─ Client dossiers                                  │
│ └─ Itinerary generation                             │
└─────────────────────────────────────────────────────┘
```

## Troubleshooting

### Service fails to start
```bash
journalctl -u reverie-api -n 50
# Check: .env file exists, SECRET_KEY is set, PYTHONPATH correct
```

### Nginx 502 Bad Gateway
```bash
# Check FastAPI is running
systemctl status reverie-api
# Check nginx upstream: cat /etc/nginx/sites-enabled/reverie-api
```

### SMTP failures (magic link emails not sending)
```bash
# Check Gmail app password is set
grep SMTP_PASSWORD /opt/reverie-api/.env
# Gmail requires app-specific password if 2FA is enabled
```

### CORS errors in browser
```bash
# Verify CORS_ORIGINS matches frontend domain
grep CORS_ORIGINS /opt/reverie-api/.env
# Should include: https://app.d2mluxury.quest
```

## Rollback

If deployment fails:

```bash
ssh root@api-reverie.d2mluxury.quest
systemctl restart reverie-api
# Check logs to see what broke
journalctl -u reverie-api -n 50
```

To revert code:
```bash
ssh root@api-reverie.d2mluxury.quest
cd /opt/reverie-api
git log --oneline  # if .git exists
git checkout <hash>  # revert to known-good commit
systemctl restart reverie-api
```

## Maintenance

### SSL Certificate Renewal

Certbot auto-renews certificates. Check renewal:
```bash
ssh root@api-reverie.d2mluxury.quest
certbot renew --dry-run
```

### Backup

Periodic backups of `api/.env` and deployment configs:
```bash
# Local backup of production .env
scp root@api-reverie.d2mluxury.quest:/opt/reverie-api/.env .env.backup
```

### Updates

Check for Python dependency updates quarterly:
```bash
cd api/
pip list --outdated
```

Update `requirements.txt` and redeploy via `deploy_api.sh`.

---

**Questions?** Contact Commander via johnloucks3@gmail.com or Telegram C2.
