#!/bin/bash

# ================================================
# JURISCONTENT - DEPLOY VIA SSH
# ================================================

echo "🚀 =========================================="
echo "   JURISCONTENT - DEPLOY VIA SSH"
echo "==========================================="

# Configurações do servidor
VPS_IP="72.62.11.134"
VPS_USER="root"  # Altere se necessário
FRONTEND_PATH="/var/www/juriscontent"
BACKEND_PATH="/var/www/juriscontent-api"
PUPPETEER_PATH="/var/www/puppeteer-stories"

echo ""
echo "📤 [1/4] Enviando FRONTEND..."
rsync -avz --progress \
  juriscontent/frontend/dist/ \
  $VPS_USER@$VPS_IP:$FRONTEND_PATH/

if [ $? -ne 0 ]; then
    echo "❌ Erro ao enviar frontend!"
    exit 1
fi

echo ""
echo "📤 [2/4] Enviando BACKEND (API)..."
rsync -avz --progress \
  --exclude 'node_modules' \
  juriscontent-api/ \
  $VPS_USER@$VPS_IP:$BACKEND_PATH/

if [ $? -ne 0 ]; then
    echo "❌ Erro ao enviar backend!"
    exit 1
fi

echo ""
echo "📤 [3/4] Enviando PUPPETEER..."
rsync -avz --progress \
  --exclude 'node_modules' \
  puppeteer-stories/ \
  $VPS_USER@$VPS_IP:$PUPPETEER_PATH/

if [ $? -ne 0 ]; then
    echo "❌ Erro ao enviar puppeteer!"
    exit 1
fi

echo ""
echo "🔧 [4/4] Executando deploy no servidor..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
  cd /var/www/juriscontent-api

  # Instalar dependências do backend
  echo "📦 Instalando dependências do backend..."
  npm install

  # Reiniciar backend
  echo "🔄 Reiniciando backend..."
  pm2 delete juriscontent-api 2>/dev/null
  pm2 start server.js --name "juriscontent-api"
  pm2 save

  # Puppeteer
  cd /var/www/puppeteer-stories
  echo "📦 Instalando dependências do puppeteer..."
  npm install

  echo "🔄 Reiniciando puppeteer..."
  pm2 delete puppeteer-stories 2>/dev/null
  pm2 start server.js --name "puppeteer-stories"
  pm2 save

  # Nginx
  echo "🌐 Reiniciando Nginx..."
  systemctl restart nginx

  echo ""
  echo "✅ Deploy concluído!"
  echo ""
  pm2 status
ENDSSH

if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "✅ DEPLOY COMPLETO!"
    echo "==========================================="
    echo ""
    echo "🌐 Acesse: http://72.62.11.134"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   pm2 logs juriscontent-api"
    echo "   pm2 logs puppeteer-stories"
    echo "   pm2 restart all"
    echo ""
else
    echo "❌ Erro durante o deploy no servidor!"
    exit 1
fi
