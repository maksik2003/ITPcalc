# Generated by Django 5.0 on 2024-02-02 07:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_alter_parameters_inherit_by'),
    ]

    operations = [
        migrations.AlterField(
            model_name='parameters',
            name='inherit_by',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
