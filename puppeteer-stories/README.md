# Puppeteer Stories

Serviço de automação e scraping com Puppeteer.

## 🚀 Deploy Automático com GitHub Actions

Este projeto está configurado para fazer deploy automático na Hostinger sempre que você fizer push para o GitHub.

## 📋 Configuração Inicial

### 1. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `puppeteer-stories`
3. Marque como privado (recomendado)
4. Clique em "Create repository"

### 2. Configurar Secrets no GitHub

Acesse: `Settings > Secrets and variables > Actions > New repository secret`

Use os mesmos secrets do juriscontent-api, exceto:

| Nome | Valor |
|------|-------|
| `DEPLOY_PATH_PUPPETEER` | Ex: `/home/usuario/public_html/puppeteer` |

### 3. Conectar repositório local ao GitHub

```bash
cd C:\Users\thale\www\puppeteer-stories

# Adicionar remote
git remote add origin https://github.com/thalesbuenoprado/puppeteer-stories.git

# Fazer primeiro commit e push
git add .
git commit -m "Initial commit with GitHub Actions"
git branch -M main
git push -u origin main
```

### 4. Configurar servidor Hostinger

```bash
# Via SSH na Hostinger
cd /home/seu_usuario/public_html

# Clonar repositório
git clone https://github.com/thalesbuenoprado/puppeteer-stories.git puppeteer

cd puppeteer

# Instalar dependências
npm install

# Instalar dependências do Puppeteer
# Pode precisar de pacotes adicionais no servidor:
# sudo apt-get install -y chromium-browser

# Iniciar com PM2
pm2 start server.js --name puppeteer-stories
pm2 save
```

## 🛠 Comandos Úteis

```bash
# Ver logs
pm2 logs puppeteer-stories

# Reiniciar
pm2 restart puppeteer-stories
```

## 📝 Estrutura

```
puppeteer-stories/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── server.js
├── package.json
└── .gitignore
```
