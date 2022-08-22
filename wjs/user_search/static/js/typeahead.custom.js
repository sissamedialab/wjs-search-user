window.onload = function() {
    // TODO: parametrize url
    var accounts = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // queryTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
        remote: {
            url: 'https://janeway.sissamedialab.it/searchapiget/%QUERY',
            wildcard: '%QUERY'
        }
    });

    // TODO: parametrize #id
    $('#id_q.typeahead').typeahead(null, {
        source: accounts,
        display: 'name',
        name: 'accounts',
        minLength: 3,
        limit: 41,
        highlight: true,
        // templates: {
        //     empty: [
        //         '<div class="empty-message">',
        //         'no account with such name',
        //         '</div>'
        //     ].join('\n'),
        //     suggestion: Handlebars.compile('<div>{{name}} ({{email}}) {{aff}}</div>')
        // }
    });
};
