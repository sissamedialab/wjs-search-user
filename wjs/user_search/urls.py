"""User search form URLs."""

from django.conf.urls import url
from wjs.user_search import views
from core import include_urls


urlpatterns = [
    url(r"^user-search/$", views.SearchView.as_view(), name="wjs_user_search"),
    url(
        r"^bis/$",
        views.SearchView.as_view(template_name="user_search/bis.html"),
        name="bis",
    ),
    # url(
    #     r"^result/$",
    #     views.SearchResult.as_view(template_name="user_search/result.html"),
    #     name="result",
    # ),
    url(
        r"^search/$",
        views.Search.as_view(),
        name="result",
    ),
    url(
        r"^searchapi$",
        views.searchapi,
        name="searchapi",
    ),
]
urlpatterns.extend(include_urls.urlpatterns)
include_urls.urlpatterns = urlpatterns
