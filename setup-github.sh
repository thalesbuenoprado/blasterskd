#!/bin/bash

echo "🚀 Setup GitHub Repositories for Juriscontent Projects"
echo "======================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para criar SSH key
setup_ssh_key() {
    echo -e "${YELLOW}📋 Configurando SSH Key para deploy...${NC}"

    if [ ! -f ~/.ssh/hostinger_deploy ]; then
        ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/hostinger_deploy -N ""
        echo -e "${GREEN}✓ SSH Key criada!${NC}"
    else
        echo -e "${YELLOW}⚠ SSH Key já existe${NC}"
    fi

    echo ""
    echo -e "${YELLOW}📋 Sua chave pública (copie para o servidor):${NC}"
    cat ~/.ssh/hostinger_deploy.pub
    echo ""

    read -p "Pressione Enter após adicionar a chave no servidor..."

    echo ""
    echo -e "${YELLOW}📋 Sua chave privada (adicione no GitHub Secret SSH_PRIVATE_KEY):${NC}"
    cat ~/.ssh/hostinger_deploy
    echo ""

    read -p "Pressione Enter após adicionar no GitHub..."
}

# Função para setup de um projeto
setup_project() {
    local project_name=$1
    local repo_url=$2
    local project_path=$3

    echo ""
    echo -e "${YELLOW}📦 Configurando $project_name...${NC}"

    cd "$project_path" || exit

    # Inicializar git se necessário
    if [ ! -d ".git" ]; then
        git init
        echo -e "${GREEN}✓ Git inicializado${NC}"
    fi

    # Adicionar remote
    if git remote | grep -q "origin"; then
        git remote remove origin
    fi
    git remote add origin "$repo_url"
    echo -e "${GREEN}✓ Remote adicionado: $repo_url${NC}"

    # Stage todos os arquivos
    git add .

    # Commit
    git commit -m "Initial commit with GitHub Actions setup" || echo "Nada para commitar"

    # Renomear branch para main
    git branch -M main

    echo -e "${GREEN}✓ $project_name pronto!${NC}"
}

# Menu principal
echo "Escolha uma opção:"
echo "1) Setup completo (SSH + todos os projetos)"
echo "2) Setup apenas SSH key"
echo "3) Setup juriscontent-api"
echo "4) Setup puppeteer-stories"
echo "5) Sair"
echo ""
read -p "Opção: " option

case $option in
    1)
        setup_ssh_key

        echo ""
        echo -e "${YELLOW}📋 Informe os dados dos repositórios:${NC}"
        read -p "URL do repositório juriscontent-api (ex: https://github.com/usuario/juriscontent-api.git): " repo_api
        read -p "URL do repositório puppeteer-stories (ex: https://github.com/usuario/puppeteer-stories.git): " repo_puppeteer

        setup_project "juriscontent-api" "$repo_api" "C:/Users/thale/www/juriscontent-api"
        setup_project "puppeteer-stories" "$repo_puppeteer" "C:/Users/thale/www/puppeteer-stories"

        echo ""
        echo -e "${GREEN}✅ Setup completo!${NC}"
        echo ""
        echo -e "${YELLOW}📋 Próximos passos:${NC}"
        echo "1. Crie os repositórios no GitHub se ainda não criou"
        echo "2. Configure os Secrets no GitHub (veja README.md)"
        echo "3. Faça push:"
        echo "   cd juriscontent-api && git push -u origin main"
        echo "   cd ../puppeteer-stories && git push -u origin main"
        ;;

    2)
        setup_ssh_key
        ;;

    3)
        read -p "URL do repositório juriscontent-api: " repo_api
        setup_project "juriscontent-api" "$repo_api" "C:/Users/thale/www/juriscontent-api"
        ;;

    4)
        read -p "URL do repositório puppeteer-stories: " repo_puppeteer
        setup_project "puppeteer-stories" "$repo_puppeteer" "C:/Users/thale/www/puppeteer-stories"
        ;;

    5)
        echo "Saindo..."
        exit 0
        ;;

    *)
        echo -e "${RED}Opção inválida${NC}"
        exit 1
        ;;
esac
