@echo off
cd /d "%~dp0"

del /f "src\pages\cocinas\serie-1-gloss.astro"
del /f "src\pages\cocinas\serie-2-matt.astro"
del /f "src\pages\cocinas\serie-3-adira.astro"
del /f "src\pages\cocinas\serie-4-universo.astro"
del /f "src\pages\cocinas\serie-5-real.astro"
del /f "src\pages\cocinas\serie-6-stone.astro"
del /f "src\pages\cocinas\serie-7-fenix.astro"
del /f "src\pages\cocinas\serie-8-finger-pull.astro"

echo Archivos eliminados
pause
