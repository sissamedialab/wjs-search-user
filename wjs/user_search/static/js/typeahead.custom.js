// function prepare_template() {
//     // I wanted to prepare a different template for each datum, based
//     // on the number of "sources" (e.g. color the source data "gray"
//     // when there is only one source), but this does not work, because
//     // the function from "suggestion" is called just once.
//     console.log(this);
//     return Handlebars.compile('<div><strong>{{{name}}}</strong> ({{email}}) {{aff}}');
// };

function searchInputAutosuggestA11y($input) {
  var tt = $input.data("tt-typeahead");
  if (!tt) return;

  var inputInst = tt.input;
  var menuInst = tt.menu;

  var menuId = "tt-listbox-" + Date.now();
  menuInst.$node.attr({ role: "listbox", id: menuId });
  inputInst.$input.attr({ "aria-controls": menuId, "aria-haspopup": "listbox" });

  menuInst.$node.on("focusin.tt-a11y", function() {
    setTimeout(function() { inputInst.$input[0].focus(); }, 0);
  });

  $input.on("typeahead:open typeahead:close typeahead:render", function() {
    menuInst.$node.removeAttr("aria-expanded");
  });

  $input.on("typeahead:render", function() {
    menuInst.$node.find(".wjs-submission-form__search-selectable").each(function(i) {
      var $el = $(this);
      var obj = $el.data("tt-selectable-object") || {};
      var email = obj.email ? obj.email.replace("@", " at ").replace(/\./g, " dot ") : "";
      var label = [obj.name, email, obj.aff, obj.orcid, obj.doi, obj.country]
        .filter(Boolean).join(", ");
      $el.attr({
        role: "option",
        "aria-selected": "false",
        "aria-label": label,
        id: menuId + "-opt-" + i,
      });
      $el.children().attr("aria-hidden", "true");
    });
  });

  var origMoveCursor = tt.moveCursor.bind(tt);
  tt.moveCursor = function(delta) {
    var origSetInputValue = inputInst.setInputValue.bind(inputInst);
    inputInst.setInputValue = function() {};
    var result = origMoveCursor(delta);
    inputInst.setInputValue = origSetInputValue;
    return result;
  };

  inputInst._shouldTrigger = function(keyName, $e) {
    if (keyName === "tab") return !$e.altKey && !$e.ctrlKey && !$e.metaKey;
    return true;
  };

  tt._onTabKeyed = function(type, $e) {
    if (!this.isOpen()) return;
    var isForward = !$e.shiftKey;
    var $current = menuInst.getActiveSelectable();
    if (!isForward && !$current) { this.close(); return; }
    var $next = menuInst.selectableRelativeToCursor(isForward ? +1 : -1);
    if ($next === null) {
      this.close();
    } else {
      $e.preventDefault();
      this.moveCursor(isForward ? +1 : -1);
    }
  };
}

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
     }).bind('typeahead:open', function() {
        if ($(this).typeahead('val').length >= minLength) {
            $(this).attr('aria-expanded', 'true');
        } else {
            $(this).attr('aria-expanded', 'false');
        }
      }).bind('typeahead:render', function(ev, suggestions) {
        $(this).attr('aria-expanded', suggestions && suggestions.length > 0);
      }).bind('typeahead:close', function() {
        $(this).attr('aria-expanded', 'false');
    }).bind("typeahead:select", function(ev, suggestion) {
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
          currentVals.name = suggestion.name || "";
          currentVals.country = suggestion.country || "";
          currentVals.fundref_id = suggestion.doi || "";
          currentVals.funding_id = "";
          targetEl.setAttribute("hx-vals", JSON.stringify(currentVals));
        }
        targetEl.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }).bind("typeahead:asyncreceive", function(ev) {
      document.dispatchEvent(new Event("typeahead:asyncreceive", { bubbles: true }));
    });

    searchInputAutosuggestA11y($(input));
  });
}

window.addEventListener("load", initTypeahead);
document.body.addEventListener("htmx:afterSwap", function(evt) {
  if (evt.target.querySelector(".typeahead")) initTypeahead();
});
