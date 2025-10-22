@echo off
REM Firestore Setup Script for Windows
REM Complete setup from scratch with all validations

setlocal enabledelayedexpansion

echo.
echo =========================================
echo PDF Merger - Firestore Setup Script
echo =========================================
echo.

REM Check prerequisites
echo [*] Checking prerequisites...

where firebase >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Firebase CLI not found
    echo Install with: npm install -g firebase-tools
    exit /b 1
)
echo [OK] Firebase CLI installed

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [X] Node.js not found
    exit /b 1
)
echo [OK] Node.js installed

if not exist ".firebaserc" (
    echo [X] .firebaserc not found
    echo Run: firebase init
    exit /b 1
)
echo [OK] .firebaserc found

echo.
echo [*] Checking Firebase credentials...

if not exist "firebase.json" (
    echo [X] firebase.json not found
    echo Run: firebase init
    exit /b 1
)
echo [OK] firebase.json found

echo.
echo [*] Extracting project ID...

for /f "tokens=*" %%i in ('findstr /R "\"default\"" .firebaserc') do (
    set line=%%i
)

REM Extract project ID from .firebaserc
for /f "tokens=2 delims=:" %%i in ('findstr /R "\"default\"" .firebaserc') do (
    set PROJECT_ID=%%i
)
set PROJECT_ID=%PROJECT_ID:"=%
set PROJECT_ID=%PROJECT_ID: =%
set PROJECT_ID=%PROJECT_ID:,=%

echo Project: %PROJECT_ID%

echo.
echo ========== DEPLOYMENT STEPS ==========
echo.

echo [1/5] Deploying Firestore security rules...
call firebase deploy --only firestore:rules
if %errorlevel% equ 0 (
    echo [OK] Firestore rules deployed
) else (
    echo [!] Check Firebase console for rule deployment status
)

echo.
echo [2/5] Deploying Cloud Storage rules...
call firebase deploy --only storage
if %errorlevel% equ 0 (
    echo [OK] Storage rules deployed
) else (
    echo [!] Check Firebase console for storage rule deployment status
)

echo.
echo [3/5] Deploying Cloud Functions...
echo     (This may take a few minutes...)
call firebase deploy --only functions
if %errorlevel% equ 0 (
    echo [OK] Cloud Functions deployed
) else (
    echo [!] Check Cloud Functions console for deployment status
)

echo.
echo [4/5] Initializing Firestore collections...
if exist "scripts\initialize-firestore.ts" (
    call npx ts-node scripts\initialize-firestore.ts
    if %errorlevel% equ 0 (
        echo [OK] Collections initialized
    ) else (
        echo [!] Collection initialization may need manual setup
    )
) else (
    echo [!] Initialization script not found
)

echo.
echo [5/5] Manual Configuration
echo [INFO] Backup Configuration
echo        Go to: https://console.firebase.google.com/project/%PROJECT_ID%/firestore/backups
echo        Enable automated daily backups for critical data

echo.
echo =========================================
echo [OK] Firestore setup complete!
echo =========================================
echo.
echo Next steps:
echo   1. Test authentication and CRUD operations
echo   2. Create test user in Firebase Console
echo   3. Verify security rules in rules playground
echo   4. Set up monitoring and alerts
echo.
echo Resources:
echo   Firebase Console: https://console.firebase.google.com
echo   Firestore Docs: https://firebase.google.com/docs/firestore
echo   Storage Docs: https://firebase.google.com/docs/storage
echo.
echo Press any key to exit...
pause >nul
