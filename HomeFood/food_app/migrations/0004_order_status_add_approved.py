from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('food_app', '0003_order_customer_name_order_phone_order_address_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='status',
            field=models.CharField(
                choices=[
                    ('Pending', 'Pending'),
                    ('Approved', 'Approved'),
                    ('Processing', 'Processing'),
                    ('Ready', 'Ready'),
                    ('Delivering', 'Delivering'),
                    ('Delivered', 'Delivered'),
                ],
                default='Pending',
                max_length=20,
            ),
        ),
    ]
