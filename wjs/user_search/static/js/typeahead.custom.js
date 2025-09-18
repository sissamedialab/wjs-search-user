// function prepare_template() {
//     // I wanted to prepare a different template for each datum, based
//     // on the number of "sources" (e.g. color the source data "gray"
//     // when there is only one source), but this does not work, because
//     // the function from "suggestion" is called just once.
//     console.log(this);
//     return Handlebars.compile('<div><strong>{{{name}}}</strong> ({{email}}) {{aff}}');
// };

function initTypeahead() {
    document.querySelectorAll('.typeahead').forEach(input => {
        if (input.dataset.initialized) return;
        input.dataset.initialized = true;

        var entity = input.dataset.entity || 'account';
        var url = entity === 'collaboration'
            ? '/searchapiget_collaboration/%QUERY'
            : '/searchapiget/%QUERY';

        var engine = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: { url: url, wildcard: '%QUERY' }
        });
        var minLength = 3;
        function gatedSource(query, sync, async) {
            if (query.length < minLength) {
                return sync([]);
            }
            return engine.search(query, sync, async);
        }

        $(input).typeahead(null, {
            source: gatedSource,
            display: 'name',
            name: entity,
            minLength: 3,
            limit: 41,
            highlight: true,
            templates: {
                empty: `<div class="empty-message">no ${entity} found</div>`,
                suggestion: Handlebars.compile('<div><strong>{{{name}}}</strong></div>')
            }
        }).bind('typeahead:select', function(ev, suggestion) {
    var targetEl;

    if (input.dataset.entity === 'collaboration') {
        targetEl = document.getElementById('id_collaboration_id');
    } else {
        targetEl = document.getElementById('id_author_id');
    }

    if (targetEl) {
        targetEl.value = suggestion.id;
        targetEl.dispatchEvent(new Event('change', { bubbles: true }));
    }
});

    });
}

window.addEventListener('load', initTypeahead);
document.body.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.target.querySelector('.typeahead')) initTypeahead();
});
