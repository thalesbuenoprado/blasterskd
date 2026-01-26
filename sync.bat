@echo off
cd /d "%~dp0"

echo.
echo === Sincronizando com GitHub ===
echo.

git status --short

if "%~1"=="" (
    set /p MSG="Mensagem do commit: "
) else (
    set "MSG=%*"
)

git add .
git commit -m "%MSG%"
git push

echo.
echo === Sincronizacao concluida! ===
pause
