#!/usr/bin/env python
import os
import sys

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
APPS_ROOT = os.path.join(PROJECT_ROOT, "HomeFood")

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)
if APPS_ROOT not in sys.path:
    sys.path.insert(0, APPS_ROOT)


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "HomeFood.settings")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
