#!/usr/bin/env bash
set -o errexit

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

gunicorn HomeFood.wsgi:application --bind 0.0.0.0:${PORT:-10000}
