from django.urls import path
from . import views

urlpatterns = [
    path("documents/", views.DocumentListCreate.as_view(), name="document-list"),
    path("documents_with_links/", views.DocumentWithLinksList.as_view(), name="document-with-links-list"),
    path("documents/delete/<int:pk>/", views.DocumentDelete.as_view(), name="delete-document"),
	path("documents/update/<int:id>/", views.DocumentUpdateView.as_view(), name="document-update"),
]