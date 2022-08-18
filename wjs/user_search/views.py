"""User search views."""

# from django.views.generic import TemplateView
from django.views.generic import FormView, ListView, View
from .forms import SearchForm
from core.models import Account
import re
from django.shortcuts import render


class SearchView(FormView):
    """A user-search view."""

    template_name = "user_search/search.html"
    form_class = SearchForm
    success_url = "/bis/"


class SearchResult(ListView):
    """A list of users."""

    model = Account

    def get_queryset(self):
        """Get some users."""
        name = "matteo"
        # Split the query string "name" at the spaces
        parts = re.split(" +", name)
        # Prepare a bind value for each splitted part
        # each bind value will be surrounded b % and space
        # except for the last one
        bind_values = [f"% {part} %" for part in parts]
        bind_values[-1] = f"% {parts[-1]}%"
        # Prepare the SQL where clauses, one for each part/bind value
        base = """
        ( concat_ws(' ',
                    '',
                    last_name,
                    nullif(middle_name,''),
                    first_name,
                    '')
          like %s
        )
        """
        clauses = [base for _ in parts]
        where = "where " + " and ".join(clauses)
        statement = (
            f"SELECT * FROM core_account {where} "
            "ORDER BY last_name, first_name LIMIT 23"
        )
        qs = Account.objects.raw(statement, bind_values)
        return qs


class Search(View):
    """Search and display."""

    def get(self, request, *args, **kwargs):
        """Render the search form."""
        form = SearchForm()
        return render(request, "user_search/search.html", dict(form=form))

    def post(self, request, *args, **kwargs):
        """Get some users."""
        form = SearchForm(request.POST)
        form.is_valid()
        # if not form.is_valid()...
        name = form.cleaned_data.get("query")
        # import ipdb; ipdb.set_trace()
        # name = form.fields['query']
        # Split the query string "name" at the spaces
        parts = re.split(" +", name)
        # Prepare a bind value for each splitted part
        # each bind value will be surrounded b % and space
        # except for the last one
        bind_values = [f"% {part} %" for part in parts]
        bind_values[-1] = f"% {parts[-1]}%"
        # Prepare the SQL where clauses, one for each part/bind value
        base = """
        ( concat_ws(' ',
                    '',
                    last_name,
                    nullif(middle_name,''),
                    first_name,
                    '')
          like %s
        )
        """
        clauses = [base for _ in parts]
        where = "where " + " and ".join(clauses)
        statement = (
            f"SELECT * FROM core_account {where} "
            "ORDER BY last_name, first_name LIMIT 23"
        )
        qs = Account.objects.raw(statement, bind_values)
        context = dict(object_list=qs, form=form)
        return render(request, "user_search/search.html", context)
