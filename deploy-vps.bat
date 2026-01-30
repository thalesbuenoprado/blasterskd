@echo off
echo.
echo ========================================
echo    JURISCONTENT - DEPLOY AUTOMATICO
echo ========================================
echo.

REM Passo 1: Limpar arquivos duplicados
echo [1/5] Limpando arquivos duplicados...
git rm -r --cached juriscontent/juriscontent 2>nul
git rm -r --cached juriscontent/juriscontent-api 2>nul
git rm -r --cached juriscontent/puppeteer-stories 2>nul
git rm --cached nul 2>nul

REM Passo 2: Build do frontend
echo [2/5] Fazendo build do frontend...
cd juriscontent\frontend
call npm run build
cd ..\..

REM Passo 3: Commit das alterações
echo [3/5] Commitando alterações...
git add .
git commit -m "Fix: Correções de layout e centralização dos previews"
git push

echo.
echo ========================================
echo    DEPLOY LOCAL CONCLUIDO!
echo ========================================
echo.
echo Proximo passo: Enviar para o VPS
echo.
echo OPCOES DE DEPLOY:
echo.
echo 1. MANUAL (Recomendado para primeira vez):
echo    - Acesse seu VPS via SSH ou FileZilla
echo    - Copie os arquivos para:
echo      * Frontend: /var/www/juriscontent
echo      * Backend:  /var/www/juriscontent-api
echo    - Execute: sudo bash deploy.sh
echo.
echo 2. AUTOMATICO (Se tiver SSH configurado):
echo    - Execute: deploy-ssh.bat
echo.
pause
