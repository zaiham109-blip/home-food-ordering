#!/usr/bin/env bash
set -o errexit

cd ..
gunicorn HomeFood.wsgi:application --bind 0.0.0.0:${PORT:-10000}
