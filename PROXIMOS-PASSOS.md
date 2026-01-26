# ✅ Configuração Completa - Próximos Passos

## 🎯 O que foi configurado

✅ Arquivos `.gitignore` criados para todos os projetos
✅ Workflows do GitHub Actions configurados
✅ READMEs detalhados criados
✅ Arquivo `.env.example` criado
✅ Script de setup automatizado criado
✅ Git inicializado e node_modules removidos do tracking
✅ Guia completo de deploy criado

---

## 🚀 Agora você precisa fazer (passo a passo):

### 1. Criar Repositórios no GitHub (5 minutos)

Acesse https://github.com/new e crie:

1. **juriscontent-api**
   - Nome: `juriscontent-api`
   - Visibilidade: Privado ✅
   - NÃO marque nenhuma opção (README, .gitignore, etc)

2. **puppeteer-stories**
   - Nome: `puppeteer-stories`
   - Visibilidade: Privado ✅
   - NÃO marque nenhuma opção

**URLs esperadas:**
- `https://github.com/thalesbuenoprado/juriscontent-api.git`
- `https://github.com/thalesbuenoprado/puppeteer-stories.git`

---

### 2. Gerar e Configurar SSH Keys (10 minutos)

#### No seu PC (Git Bash ou WSL):

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy

# Copiar chave pública
cat ~/.ssh/hostinger_deploy.pub
# ⚠️ COPIE TODO O CONTEÚDO que aparecer
```

#### No servidor Hostinger (via SSH):

```bash
# Conectar na Hostinger
ssh seu_usuario@srv_hostinger.com

# Adicionar chave pública
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Cole a chave pública
# Salve: Ctrl+X, Y, Enter

# Ajustar permissões
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Anotar informações (você vai precisar):
echo "Meu usuário: $(whoami)"
echo "Meu diretório home: $(pwd)"
hostname
```

**Anote essas informações:**
```
SSH_HOST: _______________
SSH_USERNAME: _______________
SSH_PORT: 22 (ou 65002)
DEPLOY_PATH: /home/seu_usuario/public_html/api
DEPLOY_PATH_PUPPETEER: /home/seu_usuario/public_html/puppeteer
```

---

### 3. Configurar GitHub Secrets (10 minutos)

Para **juriscontent-api**:

1. Acesse: https://github.com/thalesbuenoprado/juriscontent-api
2. Vá em: `Settings` → `Secrets and variables` → `Actions`
3. Clique em: `New repository secret`
4. Adicione estes secrets (um por um):

```bash
# No seu PC, copie a chave privada:
cat ~/.ssh/hostinger_deploy
```

| Nome | Valor |
|------|-------|
| SSH_HOST | O hostname do servidor |
| SSH_USERNAME | Seu usuário SSH |
| SSH_PORT | 22 ou 65002 |
| SSH_PRIVATE_KEY | Cole TODO o conteúdo da chave privada |
| DEPLOY_PATH | /home/seu_usuario/public_html/api |

Para **puppeteer-stories**:

1. Acesse: https://github.com/thalesbuenoprado/puppeteer-stories
2. Mesma coisa, mas use `DEPLOY_PATH_PUPPETEER` em vez de `DEPLOY_PATH`

---

### 4. Push para GitHub (5 minutos)

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

### 5. Preparar Servidor Hostinger (15 minutos)

```bash
# Conectar via SSH
ssh seu_usuario@srv_hostinger.com

# Criar diretórios
cd ~/public_html
mkdir -p api puppeteer

# Clonar repositórios (IMPORTANTE: substitua as URLs!)
git clone https://github.com/thalesbuenoprado/juriscontent-api.git api
git clone https://github.com/thalesbuenoprado/puppeteer-stories.git puppeteer

# Configurar juriscontent-api
cd api
npm install

# Criar .env (copie do .env.example e preencha)
nano .env
# Cole suas credenciais reais
# Salve: Ctrl+X, Y, Enter

# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name juriscontent-api
pm2 save
pm2 startup
# Execute o comando que aparecer (começa com sudo)

# Configurar puppeteer-stories
cd ../puppeteer
npm install

# Se precisar de .env, crie:
nano .env

# Iniciar
pm2 start server.js --name puppeteer-stories
pm2 save

# Verificar status
pm2 status
```

---

### 6. Testar Deploy Automático (2 minutos)

```bash
# No seu PC
cd C:\Users\thale\www\juriscontent-api

# Fazer uma pequena alteração
echo "# Deploy automático configurado!" >> README.md

git add .
git commit -m "test: verificar deploy automático"
git push

# Acessar e ver o deploy acontecendo:
# https://github.com/thalesbuenoprado/juriscontent-api/actions
```

---

## 📚 Arquivos Importantes Criados

1. **GUIA-DEPLOY.md** - Guia completo detalhado (LEIA PRIMEIRO!)
2. **juriscontent-api/README.md** - Documentação do projeto API
3. **puppeteer-stories/README.md** - Documentação do projeto Puppeteer
4. **setup-github.sh** - Script automatizado (opcional)
5. **juriscontent-api/.github/workflows/deploy.yml** - Workflow de deploy
6. **juriscontent-api/.env.example** - Exemplo de variáveis de ambiente

---

## 🎉 Depois que configurar

### Fluxo de trabalho normal:

```bash
# 1. Fazer alterações no código
# 2. Commit
git add .
git commit -m "feat: minha nova funcionalidade"

# 3. Push (deploy automático!)
git push

# 4. Ver deploy acontecer
# https://github.com/usuario/repo/actions

# 5. Verificar no servidor
ssh usuario@servidor
pm2 logs juriscontent-api
```

---

## ❓ Precisa de Ajuda?

1. **Leia primeiro:** `GUIA-DEPLOY.md` (guia super detalhado!)
2. **GitHub Actions com erro?** Veja os logs em: repo → Actions → clique no workflow
3. **PM2 não funciona?** Execute: `pm2 logs nome-da-app`
4. **SSH não conecta?** Teste: `ssh -i ~/.ssh/hostinger_deploy usuario@servidor`

---

## ⏱️ Tempo Estimado Total

- Criar repos: 5min
- Setup SSH: 10min
- GitHub Secrets: 10min
- Push inicial: 5min
- Configurar servidor: 15min
- Teste: 2min

**Total: ~47 minutos** ⏱️

Mas depois disso, nunca mais precisa fazer! Todo deploy será automático! 🚀

---

**Bora começar?** 💪

Comece pelo **Passo 1** e siga em ordem.
Em caso de dúvida, consulte o `GUIA-DEPLOY.md`!
