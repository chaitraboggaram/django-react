from django.db import models
from django.contrib.auth.models import User

class Document(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    agile_pn = models.CharField(max_length=100)
    agile_rev = models.CharField(max_length=100)
    doc_title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=100)
    doc_id = models.CharField(max_length=100)
    order = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.doc_title