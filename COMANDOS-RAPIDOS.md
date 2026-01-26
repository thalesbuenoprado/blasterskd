# ⚡ Comandos Rápidos - Cola de Referência

## 🔐 SSH Keys

```bash
# Gerar chave
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy

# Ver chave pública (para adicionar no servidor)
cat ~/.ssh/hostinger_deploy.pub

# Ver chave privada (para GitHub Secret)
cat ~/.ssh/hostinger_deploy

# Testar conexão
ssh -i ~/.ssh/hostinger_deploy usuario@servidor.com
```

---

## 📤 Git - Primeiro Push

```bash
# juriscontent-api
cd C:\Users\thale\www\juriscontent-api
git remote set-url origin https://github.com/thalesbuenoprado/juriscontent-api.git
git add .
git commit -m "Setup: GitHub Actions + deploy automático"
git branch -M main
git push -u origin main

# puppeteer-stories
cd C:\Users\thale\www\puppeteer-stories
git remote add origin https://github.com/thalesbuenoprado/puppeteer-stories.git
git add .
git commit -m "Setup: GitHub Actions + deploy automático"
git branch -M main
git push -u origin main
```

---

## 🚀 Servidor Hostinger - Setup Inicial

```bash
# Conectar
ssh usuario@srv.hostinger.com

# Criar estrutura
cd ~/public_html
mkdir -p api puppeteer

# Clonar repos
git clone https://github.com/thalesbuenoprado/juriscontent-api.git api
git clone https://github.com/thalesbuenoprado/puppeteer-stories.git puppeteer

# Setup juriscontent-api
cd api
npm install
nano .env  # Criar e configurar
pm2 start server.js --name juriscontent-api

# Setup puppeteer-stories
cd ../puppeteer
npm install
nano .env  # Se necessário
pm2 start server.js --name puppeteer-stories

# Salvar configuração PM2
pm2 save
pm2 startup  # Execute o comando que aparecer
```

---

## 🔄 Workflow Diário

```bash
# 1. Fazer alterações no código

# 2. Commit e push (deploy automático!)
git add .
git commit -m "feat: descrição da alteração"
git push

# 3. Acompanhar deploy
# Acesse: https://github.com/usuario/repo/actions
```

---

## 🛠️ PM2 - Gerenciar Aplicações

```bash
# Ver status de tudo
pm2 status

# Ver logs
pm2 logs juriscontent-api
pm2 logs puppeteer-stories
pm2 logs  # Todos

# Reiniciar
pm2 restart juriscontent-api
pm2 restart puppeteer-stories
pm2 restart all

# Parar
pm2 stop juriscontent-api

# Iniciar
pm2 start juriscontent-api

# Remover
pm2 delete juriscontent-api

# Ver informações detalhadas
pm2 info juriscontent-api

# Limpar logs
pm2 flush

# Monitorar em tempo real
pm2 monit
```

---

## 🔍 Debug e Troubleshooting

```bash
# Ver últimas 100 linhas de log
pm2 logs juriscontent-api --lines 100

# Ver apenas erros
pm2 logs juriscontent-api --err

# Ver processos Node rodando
ps aux | grep node

# Ver porta em uso
netstat -tulpn | grep :3001

# Matar processo em porta específica
lsof -ti:3001 | xargs kill -9

# Espaço em disco
df -h

# Uso de memória
free -h

# Processos usando mais recursos
top
# ou
htop
```

---

## 📝 Git - Comandos Úteis

```bash
# Ver status
git status

# Ver histórico
git log --oneline

# Ver diferenças
git diff

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer alterações em arquivo
git checkout -- arquivo.js

# Ver branches
git branch -a

# Criar branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main

# Atualizar do GitHub
git pull

# Ver remote configurado
git remote -v
```

---

## 🌐 NGINX - Se usar

```bash
# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Reiniciar
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

---

## 📦 NPM - Pacotes

```bash
# Instalar dependências
npm install

# Instalar pacote específico
npm install nome-do-pacote

# Instalar como dev dependency
npm install --save-dev nome-do-pacote

# Atualizar pacotes
npm update

# Ver pacotes desatualizados
npm outdated

# Limpar cache
npm cache clean --force

# Reinstalar tudo
rm -rf node_modules package-lock.json
npm install
```

---

## 🔐 Variáveis de Ambiente

```bash
# Editar .env
nano .env

# Ver variáveis
cat .env

# Testar se está carregando
node -e "require('dotenv').config(); console.log(process.env)"
```

---

## 📊 GitHub Actions - URLs Rápidas

```
# Ver workflows
https://github.com/thalesbuenoprado/juriscontent-api/actions
https://github.com/thalesbuenoprado/puppeteer-stories/actions

# Configurar secrets
https://github.com/thalesbuenoprado/juriscontent-api/settings/secrets/actions
https://github.com/thalesbuenoprado/puppeteer-stories/settings/secrets/actions

# Repositório
https://github.com/thalesbuenoprado/juriscontent-api
https://github.com/thalesbuenoprado/puppeteer-stories
```

---

## 🆘 Emergência - Rollback

```bash
# No servidor
cd ~/public_html/api

# Ver commits recentes
git log --oneline -5

# Voltar para commit específico
git reset --hard abc123

# Reiniciar aplicação
pm2 restart juriscontent-api

# OU fazer rollback via Git
git revert HEAD
git push
# GitHub Actions vai fazer deploy do revert
```

---

## 📋 Checklist de Deploy Manual

```bash
# 1. Conectar no servidor
ssh usuario@servidor

# 2. Ir para o diretório
cd ~/public_html/api

# 3. Puxar atualizações
git pull

# 4. Instalar dependências (se houver novas)
npm install

# 5. Reiniciar
pm2 restart juriscontent-api

# 6. Verificar
pm2 logs juriscontent-api
```

---

## 🔗 Links Úteis

- **Hostinger Docs**: https://support.hostinger.com
- **PM2 Docs**: https://pm2.keymetrics.io/docs
- **GitHub Actions**: https://docs.github.com/actions
- **Node.js**: https://nodejs.org/docs

---

**Salve este arquivo!** Você vai usar bastante! 📌
