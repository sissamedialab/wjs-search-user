window.onload = function() {
    // TODO: parametrize url
    var bestPictures = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        sufficient: 41,
        remote: {
            url: 'https://janeway.sissamedialab.it/searchapiget/%QUERY',
            wildcard: '%QUERY'
        }
    });

    // TODO: parametrize #id
    $('#id_q.typeahead').typeahead(null, {
        name: 'best-pictures',
        display: 'name',
        source: bestPictures
    });
};
