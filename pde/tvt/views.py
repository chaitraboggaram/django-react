import json
import os
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .serializers import UserSerializer, DocumentSerializer
from .models import Document
from rest_framework.views import APIView

class DocumentListCreate(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user).order_by('order')

    def perform_create(self, serializer):
        document = serializer.save(user=self.request.user)
        self.create_linked_documents(document)
        updated_document = Document.objects.select_related().prefetch_related('linked_documents').get(id=document.id)

        print("\n--- Created Document (Full DB Row) ---")
        print({
            "id": updated_document.id,
            "project_id": updated_document.project_id,
            "doc_type": updated_document.doc_type,
            "doc_id": updated_document.doc_id,
            "doc_title": updated_document.doc_title,
            "agile_pn": updated_document.agile_pn,
            "agile_rev": updated_document.agile_rev,
            "doc_url": updated_document.doc_url,
            "order": updated_document.order,
            "count": updated_document.count,
            "linked_docs": [
                {
                    "id": doc.id,
                    "doc_type": doc.doc_type,
                    "doc_id": doc.doc_id,
                    "doc_title": doc.doc_title
                }
                for doc in updated_document.linked_documents.all()
            ]
        })

    def create_linked_documents(self, main_doc):
        json_path = os.path.join(settings.BASE_DIR, 'files.json')
        try:
            with open(json_path, 'r') as f:
                files_data = json.load(f)
        except Exception as e:
            print(f"Error loading files.json: {e}")
            return

        matching_entry = next(
            (entry for entry in files_data if
             entry.get('project_id') == main_doc.project_id and
             entry.get('doc_type') == main_doc.doc_type and
             entry.get('doc_id') == main_doc.doc_id),
            None
        )
        if not matching_entry:
            print(f"No matching entry in files.json for document {main_doc.doc_id}")
            return

        linked_docs_to_add = []

        for linked_doc_data in matching_entry.get('linked_docs', []):
            linked_doc, created = Document.objects.get_or_create(
                user=main_doc.user,
                project_id=linked_doc_data.get('project_id'),
                doc_type=linked_doc_data.get('doc_type'),
                doc_id=linked_doc_data.get('doc_id'),
                defaults={
                    'agile_pn': linked_doc_data.get('agile_pn'),
                    'agile_rev': linked_doc_data.get('agile_rev'),
                    'doc_title': linked_doc_data.get('doc_title'),
                    'doc_url': '',
                }
            )
            if created:
                print(f"Created linked doc {linked_doc.doc_id}")
            else:
                print(f"Linked doc {linked_doc.doc_id} already exists")

            linked_docs_to_add.append(linked_doc)

        if linked_docs_to_add:
            main_doc.linked_documents.set(linked_docs_to_add)
            main_doc.save()
        print("\nMain Doc: ")
        print(main_doc)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class DocumentWithLinksList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        docs = Document.objects.filter(user=user).order_by('order')
        serializer = DocumentSerializer(docs, many=True)
        docs_data = serializer.data

        doc_map = {str(doc['id']): doc for doc in docs_data}

        doc_list = []
        for doc in docs_data:
            linked_doc_ids = doc.get('linked_documents', [])
            linked_docs = []
            for linked_id in linked_doc_ids:
                linked_doc = doc_map.get(str(linked_id))
                if linked_doc:
                    linked_doc_copy = linked_doc.copy()
                    linked_doc_copy.pop('linked_documents', None)
                    linked_docs.append(linked_doc_copy)

            doc['linked_docs'] = linked_docs
            doc.pop('linked_documents', None)

            doc_list.append(doc)
        print("\nDocument List: ")
        print(doc_list)
        return Response(doc_list)

class DocumentDelete(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

class DocumentUpdateView(generics.UpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    lookup_field = 'id'

    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class DeleteAllDocumentsView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        deleted_count, _ = Document.objects.filter(user=user).delete()
        return Response(
            {"message": f"{deleted_count} documents deleted."},
            status=status.HTTP_200_OK
        )

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]