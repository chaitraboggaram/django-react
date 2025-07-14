from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, DocumentSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Document


class DocumentListCreate(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('order')

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(user=self.request.user)
        else:
            print(serializer.errors)

class DocumentDelete(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentUpdateView(generics.UpdateAPIView):
	queryset = Document.objects.all()
	serializer_class = DocumentSerializer
	lookup_field = 'id'

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]