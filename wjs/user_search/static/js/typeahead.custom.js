// function prepare_template() {
//     // I wanted to prepare a different template for each datum, based
//     // on the number of "sources" (e.g. color the source data "gray"
//     // when there is only one source), but this does not work, because
//     // the function from "suggestion" is called just once.
//     console.log(this);
//     return Handlebars.compile('<div><strong>{{{name}}}</strong> ({{email}}) {{aff}}');
// };

function initTypeahead() {
  document.querySelectorAll(".typeahead").forEach(input => {
    if (input.dataset.initialized) return;
    input.dataset.initialized = true;

    const entity = input.dataset.entity || "account";
    const url = entity === "collaboration"
      ? "/searchapiget_collaboration/%QUERY"
      : entity === "funding"
        ? "/searchapiget_funding/%QUERY"
        : "/searchapiget/%QUERY";


    const engine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace("name"),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: { url: url, wildcard: "%QUERY" },
    });
    const minLength = 3;

    function gatedSource(query, sync, async) {
      if (query.length < minLength) {
        return sync([]);
      }
      return engine.search(query, sync, async);
    }

    $(input).typeahead(null, {
      source: gatedSource,
      display: "name",
      name: entity,
      minLength: 3,
      limit: 41,
      highlight: true,
      templates: {
        empty: `<div class="empty-message">no ${entity} found</div>`,
        suggestion: Handlebars.compile("<div class=\"row\"><span class=\"col\">{{name}}</span><span class=\"col\">{{email}}</span><span class=\"col\">{{aff}}</span> <span class=\"col\">{{orcid}}</span> <span class=\"col\">{{doi}}</span> <span class=\"col\">{{country}}</span><span class=\"col-1 text-end\">+</span></div>"),
      },
    }).bind("typeahead:select", function(ev, suggestion) {
      console.log(suggestion);
      let targetEl;

      if (entity === "collaboration") {
        targetEl = document.getElementById("id_collaboration_id");
      } else if (entity === "funding") {
        targetEl = document.getElementById("id_funding_id");
      } else {
        targetEl = document.getElementById("id_author_id");
      }

      if (targetEl) {
        targetEl.value = suggestion.id || suggestion.doi || "";
        if (entity === "funding") {
          targetEl.dataset.name = suggestion.name || "";
          targetEl.dataset.country = suggestion.country || "";

          const currentVals = JSON.parse(targetEl.getAttribute("hx-vals") || "{}");
          currentVals.funding_country = suggestion.country || "";
          targetEl.setAttribute("hx-vals", JSON.stringify(currentVals));
        }
        targetEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }).bind("typeahead:asyncreceive", function(ev) {
      document.dispatchEvent(new Event("typeahead:asyncreceive", { bubbles: true }));
    });
  });
}

window.addEventListener("load", initTypeahead);
document.body.addEventListener("htmx:afterSwap", function(evt) {
  if (evt.target.querySelector(".typeahead")) initTypeahead();
});
