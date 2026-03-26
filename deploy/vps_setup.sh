#!/bin/bash
# REVERIE VPS Setup — Debian 12 (Hetzner CX21)
# Provisions fresh server with Python, nginx, certbot, systemd service
# Run as root

set -e

echo "=== REVERIE VPS Setup (Debian 12) ==="

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get install -y \
  python3.11 \
  python3.11-venv \
  python3-pip \
  nginx \
  certbot \
  python3-certbot-nginx \
  curl \
  git

# Create application directory
echo "Creating /opt/reverie-api directory..."
mkdir -p /opt/reverie-api
cd /opt/reverie-api

# Create Python venv
echo "Setting up Python venv..."
python3.11 -m venv .venv
source .venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

echo "Venv ready at /opt/reverie-api/.venv"

# Create systemd service file
echo "Creating systemd service..."
cat > /etc/systemd/system/reverie-api.service << 'EOF'
[Unit]
Description=REVERIE FastAPI Backend
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/reverie-api
Environment="PATH=/opt/reverie-api/.venv/bin"
Environment="PYTHONPATH=/opt/reverie-api"
EnvironmentFile=/opt/reverie-api/.env
ExecStart=/opt/reverie-api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create nginx config
echo "Creating nginx configuration..."
cat > /etc/nginx/sites-available/reverie-api << 'EOF'
upstream reverie_backend {
  server 127.0.0.1:8000;
}

server {
  listen 80;
  server_name api-reverie.d2mluxury.quest;
  client_max_body_size 10M;

  location / {
    proxy_pass http://reverie_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_buffering off;
    proxy_request_buffering off;
  }
}
EOF

# Enable nginx site
echo "Enabling nginx configuration..."
ln -sf /etc/nginx/sites-available/reverie-api /etc/nginx/sites-enabled/reverie-api
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Enable and start services
echo "Enabling services..."
systemctl daemon-reload
systemctl enable nginx
systemctl enable reverie-api

# Start nginx (don't start reverie-api yet — waiting for code + .env)
systemctl restart nginx

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Copy .env file to /opt/reverie-api/.env"
echo "2. Deploy API code: ./deploy/deploy_api.sh"
echo "3. Run certbot: certbot --nginx -d api-reverie.d2mluxury.quest"
echo ""
echo "Service status: systemctl status reverie-api"
echo "Logs: journalctl -u reverie-api -f"
