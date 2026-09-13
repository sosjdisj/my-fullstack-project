@echo off
rem One-click start: Python AI(8000) / Java(3001) / main-app(5173) / sub-app(5175)
rem Prerequisite: MongoDB(27017) / Redis(6379) already running
rem Each service runs in its own window; close the window to stop that service

echo [1/4] Python AI service  http://localhost:8000
start "python-ai" cmd /k "cd /d %~dp0backend\ai-service && .venv312\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo [2/4] Java backend       http://localhost:3001
start "java-backend" cmd /k "cd /d %~dp0backend\java-backend && mvnw.cmd spring-boot:run"

echo [3/4] Frontend main-app  http://localhost:5173
start "main-app" cmd /k "cd /d %~dp0frontend\main-app && npm run dev"

echo [4/4] Frontend sub-app   http://localhost:5175
start "sub-app" cmd /k "cd /d %~dp0frontend\sub-apps\app-a && npm run dev"

echo.
echo All started: main-app http://localhost:5173  (Python 8000 / Java 3001 / sub-app 5175)
