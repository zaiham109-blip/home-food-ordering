import os
import sys

import django


def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, os.path.join(project_root, "HomeFood"))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "HomeFood.settings")
    django.setup()

    from food_app.models import User

    username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
    email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Admin@12345")

    user = User.objects.filter(username=username).first()
    if user:
        if not user.is_superuser or not user.is_staff:
            user.is_superuser = True
            user.is_staff = True
            user.set_password(password)
            user.save(update_fields=["is_superuser", "is_staff", "password"])
            print(f"Updated existing user '{username}' as superuser.")
        else:
            print(f"Superuser '{username}' already exists.")
        return

    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser '{username}' created successfully.")


if __name__ == "__main__":
    main()
