"""Configure this application."""
from django.apps import AppConfig


class UserSearchConfig(AppConfig):
    """Configuration for this django app."""

    name = "wjs.user_search"
    verbose_name = "WJS user search form"

    def ready(self):
        """Call during initialization."""
        from wjs.user_search import urls
