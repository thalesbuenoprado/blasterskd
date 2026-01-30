# 🚀 Guia de Deploy - JurisContent

## 📋 Resumo das Alterações
- ✅ Correção de centralização dos previews (Stories, Feed, TikTok, Facebook)
- ✅ Otimização dos botões do header (responsivo)
- ✅ Correção dos botões de ação (Editar, Copiar, Agendar, Baixar)
- ✅ Remoção de botões duplicados no modal fullscreen
- ✅ Melhorias de layout e UX geral

---

## 🎯 DEPLOY RÁPIDO

### Passo 1: Commit e Push
```bash
git add .
git commit -m "Fix: Correções de layout e centralização"
git push
```

### Passo 2: Acesse seu VPS
```bash
ssh root@72.62.11.134
```

### Passo 3: Atualize o código
```bash
cd /var/www/juriscontent-api
git pull

cd /var/www/juriscontent/frontend
npm install
npm run build
```

### Passo 4: Reinicie os serviços
```bash
pm2 restart all
systemctl restart nginx
```

### Passo 5: Teste
Acesse: http://72.62.11.134

---

## 📱 URLs
- **Site:** http://72.62.11.134
- **API:** http://72.62.11.134/api
