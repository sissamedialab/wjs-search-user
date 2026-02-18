"""User search form URLs."""

from django.urls import re_path as url
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
        r"^result-search/$",
        views.Search.as_view(),
        name="result",
    ),
    url(
        r"^searchapi$",
        views.searchapi,
        name="searchapi",
    ),
    url(
        r"^searchapiget/(?P<querystring>.+)",
        views.searchapiget,
        name="searchapiget",
    ),
    url(
        r"^searchta$",
        views.SearchTypeAhead.as_view(),
        name="search-typeahead",
    ),
url(r"^search-typeahead-funding$", views.SearchFundingTypeAhead.as_view(), name="search-typeahead-funding"),
url(r"^searchapiget_funding/(?P<querystring>.+)", views.searchapiget_funding, name="searchapiget_funding"),
url(r"^search-typeahead-collaboration$", views.SearchCollaborationTypeAhead.as_view(), name="search-typeahead-collaboration"),
url(r"^searchapiget_collaboration/(?P<querystring>.+)", views.searchapiget_collaboration, name="searchapiget_collaboration"),

]
urlpatterns.extend(include_urls.urlpatterns)
include_urls.urlpatterns = urlpatterns
