import subprocess
import time
import os
import sys

def main():
    print("==============================================")
    print("STARTING DISASTER DETECTION SYSTEM")
    print("==============================================")
    
    # Auto-detect and switch to virtual environment python if not currently active
    venv_python = os.path.join(os.path.dirname(os.path.abspath(__file__)), "venv", "Scripts", "python.exe")
    if os.path.exists(venv_python) and sys.executable != venv_python:
        print(f"Switching to virtual environment: {venv_python}")
        os.execv(venv_python, [venv_python] + sys.argv)
    
    # Check if backend requirements are installed
    try:
        import fastapi
        import uvicorn
    except ImportError:
        print("Backend dependencies not found in the virtual environment. Please run 'setup.bat' first.")
        sys.exit(1)
        
    print("\n[1] Starting FastAPI Backend on port 8099...")
    backend_process = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8099"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=os.path.dirname(os.path.abspath(__file__))
    )
    
    # Wait for backend to initialize
    time.sleep(3)
    
    print("\n[2] Starting React Frontend...")
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend"),
        shell=True # Required for npm on windows
    )
    
    print("\n==============================================")
    print("SYSTEM IS RUNNING")
    print("Backend: http://localhost:8099")
    print("Frontend: Check the console output above (usually http://localhost:5173)")
    print("Press Ctrl+C to stop all servers.")
    print("==============================================\n")
    
    try:
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("Done.")

if __name__ == '__main__':
    main()
