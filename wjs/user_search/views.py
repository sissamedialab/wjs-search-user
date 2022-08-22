"""User search views."""

from django.views.generic import FormView, View
from .forms import SearchForm, SearchFormTypeAhead
from core.models import Account
import re
from django.shortcuts import render
from django.http import HttpResponse
from wjs.jcom_profile.models import Correspondence
import json
import logging
logger = logging.getLogger(__name__)


class SearchView(FormView):
    """A user-search view."""

    template_name = "user_search/search.html"
    form_class = SearchForm
    success_url = "/bis/"


def get_queryset(querystring):
    """Return a queryset for the given query string."""
    # Split the query string "name" at the spaces
    parts = re.split(" +", querystring)
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
      ilike %s
    )
    """
    clauses = [base for _ in parts]
    where = "where " + " and ".join(clauses)
    statement = (
        f"SELECT * FROM core_account {where} "
        "ORDER BY last_name, first_name LIMIT 41"
    )
    # logger.debug("Search API query statement: %s\n%s", statement, bind_values)
    qs = Account.objects.raw(statement, bind_values)
    return qs


def searchapi(request):
    """Return an HTML fragment for the given querystring."""
    form = SearchForm(request.POST)
    form.is_valid()
    # if not form.is_valid()...
    querystring = form.cleaned_data.get("q", None)
    if querystring is None:
        return HttpResponse("")
    qs = get_queryset(querystring)
    res = ""
    for account in qs:
        # logger.debug("Account: %s", account)
        name = account.full_name()

        # Highlight
        pieces = re.split(" +", querystring)
        for piece in pieces:
            # Escape search chars with special meaning in regex context:
            searchre = re.sub(r"([.*+?])", r"\\1", piece)

            # remove leading % from search string (to avoid highlights
            # starting from first char)...
            searchre = re.sub("^%", "", searchre)
            # ...then replace the internal wildcards with a regex
            # equivalent:
            searchre = re.sub("%", ".*?", searchre)

            # We need to insert the html highlight tags, but:
            # - we cannot insert the tags after the field has been
            #   html-encoded because some chars could lose the regex
            #   match (e.g.: a search for "D'Adda" becomes
            #   "D&#39;Adda");
            # - we cannot insert the tags before the html encoding
            #   because the tags whould be double encoded.
            # So, we inject two control chars (as position markers)
            # before the encoding, html-encode the string and then
            # replace the control chars with the html tags
            #
            # Inject markers...
            # logger.debug("Highlight target: %s", searchre)
            name = re.sub(
                f"({searchre})", "\x00\\1\x01", name, flags=re.IGNORECASE
            )
            # logger.debug("Highlighted name: %s", name)
        # ...html encode...
        # TODO name = h($name);
        # ...markers -> html
        name = re.sub("\x00", '<span class="highlight">', name)
        name = re.sub("\x01", "</span>", name)

        # correspondences = ...
        # ignore for now...
        other = ""
        res += f"""<div class="LSRow">id-{account.id} {name} ({account.email}) {account.institution}
        {other}
        </div>"""

    return HttpResponse(res)


def searchapiget(request, querystring):
    """Return an HTML fragment for the given querystring."""
    # import ipdb; ipdb.set_trace()
    qs = get_queryset(querystring)
    res = qs_to_json(qs)
    # res = qs_to_string(qs)
    return HttpResponse(res)


def qs_to_json(qs):
    """Transform the query set into a json array of interesting data."""
    mangled_data = []
    for account in qs:
        name = account.full_name()
        correspondences = get_correspondences(account)
        # NB: typeahead.custom.js must know about the key names used in this dict
        interesting_data = dict(
            name=name,
            email=account.email,
            aff=account.institution,
            corr=correspondences,
        )
        mangled_data.append(interesting_data)
    return json.dumps(mangled_data)


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
        name = form.cleaned_data.get("q")
        # import ipdb; ipdb.set_trace()
        # name = form.fields['query']
        qs = get_queryset(name)
        context = dict(object_list=qs, form=form)
        return render(request, "user_search/search.html", context)


class SearchTypeAhead(View):
    """Search and display usins typeahead js library."""

    def get(self, request, *args, **kwargs):
        """Render the search form."""
        form = SearchFormTypeAhead()
        return render(
            request, "user_search/search-typeahead.html", dict(form=form)
        )

    def post(self, request, *args, **kwargs):
        """Get some users."""
        form = SearchForm(request.POST)
        form.is_valid()
        # if not form.is_valid()...
        name = form.cleaned_data.get("q")
        # import ipdb; ipdb.set_trace()
        # name = form.fields['query']
        qs = get_queryset(name)
        context = dict(object_list=qs, form=form)
        return render(request, "user_search/search-typeahead.html", context)


def get_correspondences(account):
    """Collect the "correspondences" of this account."""
    # hmmm... ma non dovrei trovare un account.jcom_correspondence
    # o qualcosa di simile???
    correspondences = Correspondence.objects.filter(account_id=account.id)

    # I'm interested only in a small subset of fields
    interesting_data = []
    # import ipdb; ipdb.set_trace()
    for correspondence in correspondences:
        # TODO: data from sgp is not archived, this seems wrong even
        # if sgp contains very few data. Please check.
        if correspondence.source == 'sgp':
            continue
        notes = correspondence.notes
        # logger.debug("NOTES (%s): %s", correspondence.source, notes)
        interesting_data.append(
            dict(
                source=correspondence.source,
                first=different_data("firstName", account, notes),
                middle=different_data("middleName", account, notes),
                last=different_data("lastName", account, notes),
                full=" ".join(
                    [
                        _
                        for _ in (
                            different_data("firstName", account, notes),
                            different_data("middleName", account, notes),
                            different_data("lastName", account, notes),
                        )
                        if _ is not None
                    ]
                ),
                aff=different_data("organization", account, notes),
                email=different_data("email", account, notes),
            )
        )
    return interesting_data


def different_data(attribute, account, notes):
    """Check if "attribute" has the same value in "account" and "note".

    Return note's value only if different.
    Return the symbol ⧺ if they are identical.
    """
    if attribute == "organization":
        attribute = "institution"
    if notes.get(attribute, None) != getattr(account, attribute.replace("Name", "_name")):
        return notes.get(attribute, None)
    return "⧺"
