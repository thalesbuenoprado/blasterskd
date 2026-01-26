# 🚀 Guia Rápido de Deploy - Hostinger + GitHub Actions

## 📋 Checklist Rápido

- [ ] Criar repositórios no GitHub
- [ ] Gerar SSH keys
- [ ] Configurar secrets no GitHub
- [ ] Configurar servidor Hostinger
- [ ] Fazer primeiro push
- [ ] Verificar deploy automático

---

## 1️⃣ Criar Repositórios no GitHub

### juriscontent-api
1. Acesse: https://github.com/new
2. Nome: `juriscontent-api`
3. Privado: ✅
4. Criar repository

### puppeteer-stories
1. Acesse: https://github.com/new
2. Nome: `puppeteer-stories`
3. Privado: ✅
4. Criar repository

**URLs dos seus repositórios:**
- juriscontent-api: `https://github.com/thalesbuenoprado/juriscontent-api.git`
- puppeteer-stories: `https://github.com/thalesbuenoprado/puppeteer-stories.git`

---

## 2️⃣ Gerar SSH Keys (no seu PC)

```bash
# Gerar chave para deploy
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/hostinger_deploy

# Mostrar chave pública (copie isso)
cat ~/.ssh/hostinger_deploy.pub

# Mostrar chave privada (copie isso também)
cat ~/.ssh/hostinger_deploy
```

---

## 3️⃣ Configurar Servidor Hostinger

### 3.1 Adicionar SSH Key no servidor

1. Acesse Hostinger via SSH:
```bash
ssh seu_usuario@srv123.hostinger.com
```

2. Adicione a chave pública:
```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
# Cole a chave pública que você copiou
# Salve: Ctrl+X, depois Y, depois Enter
```

3. Ajuste permissões:
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 3.2 Anotar informações do servidor

Você vai precisar desses dados para os GitHub Secrets:

```
SSH_HOST: srv123.hostinger.com (substitua pelo seu)
SSH_USERNAME: seu_usuario (substitua pelo seu)
SSH_PORT: 22 (ou 65002, depende da Hostinger)
SSH_PRIVATE_KEY: (a chave privada que você gerou)
```

### 3.3 Preparar diretórios no servidor

```bash
# Ainda conectado via SSH na Hostinger:

# Navegar para seu public_html
cd ~/public_html

# Criar diretórios para os projetos
mkdir -p api
mkdir -p puppeteer

# Anotar os caminhos completos:
pwd
# Resultado exemplo: /home/u123456789/public_html
```

**Anote os caminhos:**
```
DEPLOY_PATH: /home/u123456789/public_html/api
DEPLOY_PATH_PUPPETEER: /home/u123456789/public_html/puppeteer
```

### 3.4 Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

---

## 4️⃣ Configurar Secrets no GitHub

Para **CADA** repositório (juriscontent-api e puppeteer-stories):

1. Acesse o repositório no GitHub
2. Vá em: `Settings` > `Secrets and variables` > `Actions`
3. Clique em: `New repository secret`

### Secrets para juriscontent-api:

| Nome | Valor | Exemplo |
|------|-------|---------|
| `SSH_HOST` | Endereço do servidor | `srv123.hostinger.com` |
| `SSH_USERNAME` | Seu usuário SSH | `u123456789` |
| `SSH_PORT` | Porta SSH | `22` ou `65002` |
| `SSH_PRIVATE_KEY` | Chave privada completa | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DEPLOY_PATH` | Caminho no servidor | `/home/u123456789/public_html/api` |

### Secrets para puppeteer-stories:

Use os mesmos de cima, mas mude:

| Nome | Valor |
|------|-------|
| `DEPLOY_PATH_PUPPETEER` | `/home/u123456789/public_html/puppeteer` |

---

## 5️⃣ Conectar Projetos ao GitHub (no seu PC)

### juriscontent-api

```bash
cd C:\Users\thale\www\juriscontent-api

# Remover remote antigo
git remote remove origin

# Adicionar novo remote
git remote add origin https://github.com/thalesbuenoprado/juriscontent-api.git

# Adicionar arquivos
git add .

# Commit
git commit -m "Setup GitHub Actions para deploy automático"

# Renomear branch para main
git branch -M main

# Push (primeira vez)
git push -u origin main
```

### puppeteer-stories

```bash
cd C:\Users\thale\www\puppeteer-stories

# Adicionar remote
git remote add origin https://github.com/thalesbuenoprado/puppeteer-stories.git

# Adicionar arquivos
git add .

# Commit
git commit -m "Setup GitHub Actions para deploy automático"

# Renomear branch para main
git branch -M main

# Push (primeira vez)
git push -u origin main
```

---

## 6️⃣ Verificar Deploy

1. Após o push, acesse:
   - https://github.com/thalesbuenoprado/juriscontent-api/actions
   - https://github.com/thalesbuenoprado/puppeteer-stories/actions

2. Você verá o workflow rodando em tempo real

3. Se der erro:
   - Clique no workflow que falhou
   - Leia os logs para identificar o problema
   - Geralmente é secret configurado errado

---

## 7️⃣ Primeira Configuração Manual no Servidor

**Só precisa fazer uma vez!**

```bash
# SSH na Hostinger
ssh seu_usuario@srv123.hostinger.com

# Configurar juriscontent-api
cd ~/public_html/api

# Criar arquivo .env
nano .env
# Cole suas variáveis de ambiente:
# PORT=3001
# DATABASE_URL=...
# etc
# Salve: Ctrl+X, Y, Enter

# Iniciar aplicação
pm2 start server.js --name juriscontent-api
pm2 save
pm2 startup  # Execute o comando que aparecer

# Configurar puppeteer-stories
cd ~/public_html/puppeteer

# Criar .env se necessário
nano .env

# Iniciar aplicação
pm2 start server.js --name puppeteer-stories
pm2 save
```

---

## 🎉 Pronto! Agora é automático!

A partir de agora, sempre que você fizer:

```bash
git add .
git commit -m "Minhas alterações"
git push
```

O GitHub Actions vai automaticamente:
1. Conectar no servidor
2. Fazer `git pull`
3. Rodar `npm install`
4. Reiniciar a aplicação com PM2

---

## 🛠 Comandos Úteis

### Ver logs das aplicações
```bash
ssh seu_usuario@srv123.hostinger.com
pm2 logs juriscontent-api
pm2 logs puppeteer-stories
```

### Ver status
```bash
pm2 status
```

### Reiniciar manualmente
```bash
pm2 restart juriscontent-api
pm2 restart puppeteer-stories
```

### Parar aplicação
```bash
pm2 stop juriscontent-api
```

---

## ❌ Troubleshooting

### Deploy falhou?

1. **Erro de autenticação SSH**
   - Verifique se a chave pública está no `~/.ssh/authorized_keys` do servidor
   - Verifique se o `SSH_PRIVATE_KEY` no GitHub está correto (com BEGIN e END)

2. **Erro "Permission denied"**
   - Verifique as permissões: `chmod 600 ~/.ssh/authorized_keys`

3. **PM2 não encontrado**
   - Instale: `npm install -g pm2`

4. **Aplicação não inicia**
   - Verifique logs: `pm2 logs nome-da-app`
   - Verifique se o `.env` existe e está correto

### Testar conexão SSH manualmente

```bash
ssh -i ~/.ssh/hostinger_deploy seu_usuario@srv123.hostinger.com
```

Se conectar, o SSH está OK!

---

## 📞 Precisa de Ajuda?

1. Verifique os READMEs de cada projeto
2. Veja os logs do GitHub Actions
3. Veja os logs do PM2 no servidor
4. Entre em contato com suporte da Hostinger se for problema de servidor

---

**Criado em:** 19/01/2026
**Atualizado em:** 19/01/2026
