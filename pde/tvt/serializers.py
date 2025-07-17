from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Document

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user

class DocumentSerializer(serializers.ModelSerializer):
    agile_pn = serializers.CharField(required=False, allow_blank=True)
    agile_rev = serializers.CharField(required=False, allow_blank=True)
    doc_title = serializers.CharField(required=False, allow_blank=True)
    project_id = serializers.CharField(required=False)
    doc_type = serializers.CharField(required=False)
    doc_id = serializers.CharField(required=False)
    doc_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "project_id",
            "doc_type",
            "doc_id",
            "doc_url",
            "agile_pn",
            "agile_rev",
            "doc_title",
            "user",
        ]
        extra_kwargs = {"user": {"read_only": True}}