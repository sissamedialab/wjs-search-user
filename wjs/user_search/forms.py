"""Forms."""

from django import forms
from .widgets import LSTextInput, TATextInput


class SearchForm(forms.Form):
    """Search form."""

    q = forms.CharField(max_length=123, widget=LSTextInput())


class SearchFormTypeAhead(forms.Form):
    """Search form."""

    author = forms.CharField(max_length=123, required=False, widget=TATextInput(attrs={"placeholder": "Search registered authors by name, surname, email or Orcid Id"}, entity="account"))

class SearchFormTypeAheadCollaboration(forms.Form):
    """Search form."""

    collaboration = forms.CharField(max_length=123, required=False, widget=TATextInput(attrs={"placeholder": "Collaboration's name"}, entity="collaboration"))


class SearchFormTypeAheadFunding(forms.Form):
    """Search form."""

    funding = forms.CharField(max_length=123, required=False, widget=TATextInput(attrs={"placeholder": "Funding's name"}, entity="funding"))
