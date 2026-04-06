from django.urls import path

from .views import Rankings, FAQs, ExternalStats, ClearCache

urlpatterns = [
    path("rankings/", Rankings.as_view()),
    path("faqs/", FAQs.as_view()),
    path("external-stats/", ExternalStats.as_view(), name="external-stats"),
    path("clear-cache/", ClearCache.as_view(), name="clear-cache"),
]
