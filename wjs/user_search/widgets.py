"""Search-as-you type special widgets."""

from django.forms.widgets import Input


class LSTextInput(Input):
    """Live-search text input widget."""

    input_type = "text"
    template_name = "user_search/lstext.html"

    def __init__(self, attrs=None):
        """Ensure that needed attributes are present."""
        if attrs is None:
            attrs = {}
        attrs.setdefault("id", "livesearch")
        attrs.setdefault("onkeypress", "liveSearchStart()")
        attrs.setdefault("autofocus", "autofocus")
        attrs.setdefault("autocomplete", "off")
        attrs.setdefault("placeholder", "🔎")
        super().__init__(attrs)

    class Media:
        """Assets such as css and js.

        See https://docs.djangoproject.com/en/4.1/topics/forms/media/
        """

        js = ("js/livesearch.js",)


class TATextInput(Input):
    """Typeahead-search text input widget.

    https://typeahead.js.org/
    """

    input_type = "text"
    template_name = "user_search/tatext.html"

    def __init__(self, attrs=None):
        """Ensure that needed attributes are present."""
        if attrs is None:
            attrs = {}
        attrs.setdefault("autofocus", "autofocus")
        attrs.setdefault("autocomplete", "off")
        attrs.setdefault("class", "typeahead")
        attrs.setdefault("placeholder", "🔎")
        super().__init__(attrs)

    class Media:
        """Assets such as css and js.

        See https://docs.djangoproject.com/en/4.1/topics/forms/media/
        """

        css = dict(all=("css/typeahead.custom.css",))
        js = (
            "js/jquery-3.6.0.min.js",
            "js/typeahead.bundle.js",
            "js/typeahead.custom.js",
        )
