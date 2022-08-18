"""Forms."""

from django import forms
from .widgets import LSTextInput


class SearchForm(forms.Form):
    """Search form."""

    q = forms.CharField(max_length=123, widget=LSTextInput())
