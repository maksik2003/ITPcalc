# Generated by Django 5.0 on 2024-02-07 10:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_logging'),
    ]

    operations = [
        migrations.AddField(
            model_name='logging',
            name='parameters',
            field=models.TextField(null=True),
        ),
    ]