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
        self.fill_missing_fields_from_json(document)
        self.create_linked_documents(document)

    def fill_missing_fields_from_json(self, document):
        json_path = os.path.join(settings.BASE_DIR, "files.json")

        try:
            with open(json_path, "r") as f:
                files_data = json.load(f)
        except Exception as e:
            print(f"Error loading files.json: {e}")
            return

        matching_entry = next(
            (
                entry
                for entry in files_data
                if entry.get("project_id") == document.project_id
                and entry.get("doc_type") == document.doc_type
                and entry.get("doc_id") == document.doc_id
            ),
            None,
        )

        if not matching_entry:
            return

        updated = False
        if not document.agile_pn and matching_entry.get("agile_pn"):
            document.agile_pn = matching_entry["agile_pn"]
            updated = True
        if not document.agile_rev and matching_entry.get("agile_rev"):
            document.agile_rev = matching_entry["agile_rev"]
            updated = True
        if not document.doc_title and matching_entry.get("doc_title"):
            document.doc_title = matching_entry["doc_title"]
            updated = True
        if updated:
            document.save()

    def create_linked_documents(self, main_doc, visited=None):
        if visited is None:
            visited = set()

        key = f"{main_doc.project_id}:{main_doc.doc_type}:{main_doc.doc_id}"

        if key in visited:
            return

        visited.add(key)
        json_path = os.path.join(settings.BASE_DIR, "files.json")

        try:
            with open(json_path, "r") as f:
                files_data = json.load(f)
        except Exception as e:
            print(f"Error loading files.json: {e}")
            return

        matching_entry = next(
            (
                entry
                for entry in files_data
                if entry.get("project_id") == main_doc.project_id
                and entry.get("doc_type") == main_doc.doc_type
                and entry.get("doc_id") == main_doc.doc_id
            ),
            None,
        )

        if not matching_entry:
            print(f"No matching entry in files.json for document {main_doc.doc_id}")
            return

        linked_docs_to_add = []
        for linked_doc_data in matching_entry.get("linked_docs", []):
            full_data = next(
                (
                    entry
                    for entry in files_data
                    if entry.get("project_id") == linked_doc_data.get("project_id")
                    and entry.get("doc_type") == linked_doc_data.get("doc_type")
                    and entry.get("doc_id") == linked_doc_data.get("doc_id")
                ),
                None,
            )

            defaults = {
                "agile_pn": full_data.get("agile_pn", "") if full_data else "",
                "agile_rev": full_data.get("agile_rev", "") if full_data else "",
                "doc_title": full_data.get("doc_title", "") if full_data else "",
                "doc_url": "",
            }

            linked_doc, created = Document.objects.get_or_create(
                user=main_doc.user,
                project_id=linked_doc_data.get("project_id"),
                doc_type=linked_doc_data.get("doc_type"),
                doc_id=linked_doc_data.get("doc_id"),
                defaults=defaults,
            )
            linked_docs_to_add.append(linked_doc)
            self.create_linked_documents(linked_doc, visited)

        if linked_docs_to_add:
            main_doc.linked_documents.set(linked_docs_to_add)
            main_doc.save()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class DocumentWithLinksList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        docs = Document.objects.filter(user=user).order_by("order")
        serializer = DocumentSerializer(docs, many=True)
        docs_data = serializer.data
        doc_map = {str(doc["id"]): doc for doc in docs_data}

        def resolve_linked_docs(linked_ids, visited):
            result = []
            for linked_id in linked_ids:
                linked_id_str = str(linked_id)

                if linked_id_str in visited:
                    continue

                visited.add(linked_id_str)
                linked_doc = doc_map.get(linked_id_str)

                if linked_doc:
                    linked_doc_copy = linked_doc.copy()
                    nested_ids = linked_doc_copy.get("linked_documents", [])
                    linked_doc_copy.pop("linked_documents", None)
                    nested_linked_docs = resolve_linked_docs(nested_ids, visited)

                    if nested_linked_docs:
                        linked_doc_copy["linked_docs"] = nested_linked_docs
                    result.append(linked_doc_copy)

            return result

        doc_list = []
        for doc in docs_data:
            visited = set([str(doc["id"])])
            linked_doc_ids = doc.get("linked_documents", [])
            full_linked_docs = resolve_linked_docs(linked_doc_ids, visited)
            doc["linked_docs"] = full_linked_docs
            doc.pop("linked_documents", None)
            doc_list.append(doc)
        return Response(doc_list)


class DocumentDelete(generics.DestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)


class DocumentUpdateView(generics.UpdateAPIView):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    lookup_field = "id"

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
            status=status.HTTP_200_OK,
        )


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]