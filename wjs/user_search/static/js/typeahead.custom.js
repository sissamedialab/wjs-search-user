window.onload = function() {

    var bestPictures = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: 'https://janeway.sissamedialab.it/searchapiget/%QUERY',
            wildcard: '%QUERY'
        }
    });

    // $('#remote .typeahead').typeahead(null, {
    $('#id_q.typeahead').typeahead(null, {
        name: 'best-pictures',
        display: 'name',
        source: bestPictures
    });

    alert("LOADED");
};
