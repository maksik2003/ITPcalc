from django.db import models
from encrypted_model_fields.fields import EncryptedCharField

# Create your models here.
class serviceList(models.Model):

    name = models.CharField(max_length=128)
    description = models.TextField()

    def __str__(self) -> str:
        return self.name
    
class parameters(models.Model):

    id_service = models.ForeignKey(serviceList, on_delete=models.PROTECT)
    id_text = models.CharField(max_length=128)
    name = models.CharField(max_length=128)
    type = models.CharField(max_length=128)
    step = models.IntegerField(default=0)
    min_value = models.IntegerField(default=0)
    max_value = models.IntegerField(default=0)
    price = models.FloatField()
    inherit_by = models.CharField(max_length=128, blank=True, null=True)
    description = models.TextField()
    isOneGetService = models.BooleanField(default=False)
    twoByOne = models.BooleanField(default=False)
    twoByOneValue = models.IntegerField(default=0)
    value = models.CharField(max_length=256, blank=True, null=True)
    isAdditionalService = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.id_text + ' | ' + self.name

class parametersList(models.Model):


    id_param = models.ForeignKey(parameters, on_delete=models.PROTECT)
    value = models.CharField(max_length=128)
    price = models.FloatField(default=0)

class templates(models.Model):

    id_service = models.ForeignKey(serviceList, on_delete=models.PROTECT)
    template_name = models.CharField(max_length=128)

    def __str__(self) -> str:
        return self.template_name

class templateParams(models.Model):

    id_template = models.ForeignKey(templates, on_delete=models.PROTECT)
    id_text_param = models.ForeignKey(parameters, on_delete=models.PROTECT)
    value = models.CharField(max_length=64)

class logging(models.Model):

    log = models.TextField()
    parameters = models.TextField(null=True)
    creationTime = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return self.log
    
class orders(models.Model):

    username = models.CharField(max_length=256)
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=64)
    services = models.JSONField(max_length=8)
    ticket_summary = models.FloatField()
    creationTime = models.DateTimeField(auto_now_add=True)

class mailServerOptions(models.Model):

    user_login = models.CharField(max_length=128)
    user_password = EncryptedCharField(max_length=32)
    message_from = models.CharField(max_length=128)
    server = models.CharField(max_length=64)
    port = models.IntegerField(default=587)
    companyMail = models.CharField(max_length=128)
