@echo off
echo ====================================================
echo DISASTER DAMAGE DETECTION SYSTEM SETUP
echo ====================================================

echo.
echo [1] Creating Python Virtual Environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo Error creating virtual environment. Ensure python is in your PATH.
    pause
    exit /b %errorlevel%
)

echo.
echo [2] Activating Virtual Environment...
call venv\Scripts\activate.bat

echo.
echo [3] Upgrading pip...
python -m pip install --upgrade pip

echo.
echo [4] Installing Dependencies from requirements.txt...
pip install -r requirements.txt

echo.
echo [5] Verifying GPU Support...
python -c "import torch; print('\n======================================\nGPU AVAILABLE:', torch.cuda.is_available()); print('CUDA VERSION:', torch.version.cuda); print('DEVICE NAME:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None'); print('======================================\n')"

echo.
echo [6] Installing Frontend Dependencies...
cd frontend
if exist package.json (
    call npm install
) else (
    echo No package.json found in frontend directory. Please ensure React is initialized.
)
cd ..

echo.
echo Setup Complete!
echo To activate the environment in the future, run: venv\Scripts\activate
echo.
pause
