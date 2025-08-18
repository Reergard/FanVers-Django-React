# tree_clean.py
import os

EXCLUDED = {
    ".git", ".venv", "env", "venv", "__pycache__",
    ".mypy_cache", ".pytest_cache", ".idea", ".vscode",
    "dist", "build", "Scripts", ".eggs", ".tox", "site-packages",
    "node_modules", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    ".DS_Store", "Thumbs.db", ".env.local", ".env.development.local",
    ".env.test.local", ".env.production.local", "*.log", "*.sqlite3",
    "*.db", "*.pyc", "*.pyo", "*.pyd", "*.so", "*.dll", "*.dylib",
    "coverage", ".nyc_output", ".coverage", "htmlcov", ".pytest_cache",
    "*.egg-info", "*.egg", "pip-log.txt", "pip-delete-this-directory.txt"
}
MAX_DEPTH = 4

def print_tree(start_path=".", prefix="", depth=0):
    if depth > MAX_DEPTH:
        return
    try:
        entries = sorted(
            [e for e in os.listdir(start_path) if e not in EXCLUDED and not e.endswith((".pyc", ".pyo", ".log", ".sqlite3", ".db"))]
        )
    except Exception:
        return

    for i, entry in enumerate(entries):
        path = os.path.join(start_path, entry)
        connector = "└── " if i == len(entries) - 1 else "├── "
        print(f"{prefix}{connector}{entry}")
        if os.path.isdir(path):
            extension = "    " if i == len(entries) - 1 else "│   "
            print_tree(path, prefix + extension, depth + 1)

if __name__ == "__main__":
    print("📁 Проектная структура:")
    print_tree() 