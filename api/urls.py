from django.urls import path

from .views import Rankings, FAQs, ClearCache, DeleteFetchRecord, UpdateStats

urlpatterns = [
    path("rankings/", Rankings.as_view()),
    path("faqs/", FAQs.as_view()),
    path("cc/", ClearCache.as_view(), name="clear-cache"),
    path("dfr/", DeleteFetchRecord.as_view(), name="delete-fetch-record"),
    path("us/", UpdateStats.as_view(), name="update-stats"),
]
