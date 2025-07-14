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
    class Meta:
        model = Document
        fields = [
            "id",
            "agile_pn",
            "agile_rev",
            "doc_title",
            "doc_type",
            "doc_id",
            "created_at",
            "author",
        ]
        extra_kwargs = {"author": {"read_only": True}}
