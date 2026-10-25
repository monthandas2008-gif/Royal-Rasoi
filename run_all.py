import subprocess
import sys
import os
import time

def run_all():
    root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root, "backend")
    frontend_dir = os.path.join(root, "frontend")

    print("=" * 60)
    print("      ROYAL RASOI - FINE INDIAN DINING (BOISAR)")
    print("           Unified Single-Command Runner")
    print("=" * 60)

    # Launch Backend
    print("\n[1/2] Launching FastAPI Backend on http://localhost:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "main:app", "--reload", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)

    # Launch Frontend
    print("[2/2] Launching Next.js Frontend on http://localhost:3000 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_cmd = [npm_cmd, "run", "dev"]
    frontend_proc = subprocess.Popen(frontend_cmd, cwd=frontend_dir)

    print("\n✨ Both servers are running successfully!")
    print("----------------------------------------------------------")
    print("👉 Frontend: http://localhost:3000")
    print("👉 Backend API: http://localhost:8000")
    print("👉 Interactive Docs: http://localhost:8000/docs")
    print("----------------------------------------------------------")
    print("Press Ctrl+C in this terminal anytime to stop both servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Royal Rasoi servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Servers stopped cleanly.")

if __name__ == "__main__":
    run_all()
