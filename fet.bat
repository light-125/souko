@echo off
:loop
taskkill /F /IM chrome.exe /IM msedge.exe
goto loop
