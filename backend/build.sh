#!/usr/bin/env bash
set -o errexit

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate --noinput
