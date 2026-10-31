@echo off
REM Lance le jeu en local sur http://localhost:5190 (necessite Node.js)
cd /d "%~dp0"
start "" http://localhost:5190
npx --yes serve -l 5190 .
