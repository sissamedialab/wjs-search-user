"""Forms."""

from django import forms
from .widgets import LSTextInput, TATextInput


class SearchForm(forms.Form):
    """Search form."""

    q = forms.CharField(max_length=123, widget=LSTextInput())


class SearchFormTypeAhead(forms.Form):
    """Search form."""

    author = forms.CharField(max_length=123, required=False, widget=TATextInput(attrs={"placeholder": "Search author (name, surname, Orcid ID, mail..."}, entity="account"))

class SearchFormTypeAheadCollaboration(forms.Form):
    """Search form."""

    collaboration = forms.CharField(max_length=123, required=False, widget=TATextInput(attrs={"placeholder": "Collaboration's name"}, entity="collaboration"))
