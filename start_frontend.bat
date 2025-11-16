@echo off
echo Starting React Frontend...
cd frontend
echo Starting React server on 0.0.0.0:3000 (accessible depuis le reseau local)...
set HOST=0.0.0.0
npm start
pause

