#!/usr/bin/env bash
# 部署腳本：在 VPS 上執行
set -e

APP_DIR="/var/www/presentation-system"
SERVICE="presentation-system"

echo "▶ 拉取最新程式碼"
cd "$APP_DIR"
git pull

echo "▶ 安裝依賴"
bun install --frozen-lockfile

echo "▶ 執行 DB migration"
bun prisma migrate deploy

echo "▶ 建置"
bun run build

echo "▶ 重啟服務"
systemctl restart "$SERVICE"
systemctl status "$SERVICE" --no-pager

echo "✓ 部署完成"
