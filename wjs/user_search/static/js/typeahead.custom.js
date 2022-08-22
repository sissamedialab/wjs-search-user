// function prepare_template() {
//     // I wanted to prepare a different template for each datum, based
//     // on the number of "sources" (e.g. color the source data "gray"
//     // when there is only one source), but this does not work, because
//     // the function from "suggestion" is called just once.
//     console.log(this);
//     return Handlebars.compile('<div><strong>{{{name}}}</strong> ({{email}}) {{aff}}');
// };

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
        templates: {
            empty: [
                '<div class="empty-message">',
                'no account with such name',
                '</div>'
            ].join('\n'),
            suggestion: Handlebars.compile(
                '<div><strong>{{{name}}}</strong> ({{email}}) {{aff}}\n \
<ul>{{#each corr}}<li>{{{source}}} {{full}} ({{email}}) {{aff}}</li>{{/each}}</ul>\n \
</div>')
        }
    });
};
