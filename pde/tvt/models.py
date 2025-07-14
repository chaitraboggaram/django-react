from django.db import models
from django.contrib.auth.models import User


class Document(models.Model):
    agile_pn = models.CharField(max_length=100, default="NA")
    agile_rev = models.CharField(max_length=100, default="NA")
    doc_title = models.CharField(max_length=225, default="Untitled")
    doc_type = models.CharField(max_length=100, default="General")
    doc_id = models.CharField(max_length=100, default="0000")
    created_at = models.DateTimeField(auto_now_add=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")

    def __str__(self):
        return self.doc_title