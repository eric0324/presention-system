#!/usr/bin/env bash
# 部署腳本：在 VPS 上執行
set -e

# 確保 bun 在 PATH 中（sudo／非互動 shell 不會載入 ~/.bashrc）
export PATH="/root/.bun/bin:$HOME/.bun/bin:$PATH"

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
