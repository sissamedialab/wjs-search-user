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

        var source = new Bloodhound({
            datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
            queryTokenizer: Bloodhound.tokenizers.whitespace,
            remote: { url: url, wildcard: '%QUERY' }
        });

        $(input).typeahead(null, {
            source: source,
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
            var targetId = input.dataset.target || 'id_author_id';
            var targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.value = suggestion.id;
            targetEl?.dispatchEvent(new Event('change', { bubbles: true }));
        });
    });
}

window.addEventListener('load', initTypeahead);
document.body.addEventListener('htmx:afterSwap', function(evt) {
    if (evt.target.querySelector('.typeahead')) initTypeahead();
});
