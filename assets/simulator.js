/* ARC-20 transfer outcome simulator.
   Engine version 2.0.0, Bitcoin mainnet rule set.

   Client-side port of the fungible-token coloring logic in the Bitcoin Universe
   Atomicals indexer (a fork of atomicals-electrumx):
   electrumx/lib/atomicals_blueprint_builder.py, in particular
   assign_expected_outputs_basic, calculate_outputs_to_color_for_ft_atomical_ids,
   color_ft_atomicals_regular, color_ft_atomicals_split, custom_color_ft_atomicals
   and order_ft_inputs.

   Everything runs locally in the browser. Nothing entered here is logged or
   transmitted anywhere. */
(function () {
  "use strict";

  /* ---------------- Rule engine ---------------- */

  /* order_ft_inputs with sort_by_fifo = true: walk inputs in index order and
     record each token the first time it appears, ties broken by token id.
     Legacy ordering (before height 819181) sorted by token id only. */
  function orderFtInputs(tokens, fifo, log) {
    var list = [];
    if (fifo) {
      var seen = {};
      var byInput = {};
      tokens.forEach(function (t) {
        t.inputs.forEach(function (idx) {
          byInput[idx] = byInput[idx] || [];
          byInput[idx].push(t.id);
        });
      });
      Object.keys(byInput).map(Number).sort(function (a, b) { return a - b; }).forEach(function (idx) {
        byInput[idx].slice().sort().forEach(function (id) {
          if (seen[id]) { return; }
          seen[id] = true;
          list.push(tokens.filter(function (t) { return t.id === id; })[0]);
        });
      });
      log("Ordering tokens FIFO by the first input index each appears at: " +
        list.map(function (t) { return t.id; }).join(", ") + ".");
    } else {
      list = tokens.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; });
      log("Legacy ordering: tokens sorted by id: " + list.map(function (t) { return t.id; }).join(", ") + ".");
    }
    return list;
  }

  /* assign_expected_outputs_basic. Returns [cleanly, indexes, remaining]. */
  function assignBasic(totalValue, outputs, startIdx, customActive) {
    var idxs = [];
    var remaining = totalValue;
    if (startIdx >= outputs.length) { return [false, idxs, 0]; }
    for (var i = startIdx; i < outputs.length; i++) {
      var out = outputs[i];
      if (out.opReturn) { continue; }
      if (customActive) {
        idxs.push(i);
        remaining -= out.sats;
        if (remaining > 0) { continue; }
        if (remaining === 0) { return [true, idxs, 0]; }
        return [false, idxs, remaining];
      }
      if (out.sats <= remaining) {
        idxs.push(i);
        remaining -= out.sats;
        if (remaining === 0) { return [true, idxs, 0]; }
      } else {
        return [false, idxs, remaining];
      }
    }
    return [false, idxs, remaining];
  }

  function colorRegular(tokens, outputs, fifo, customActive, log) {
    var ordered = orderFtInputs(tokens, fifo, log);
    var nextStart = 0;
    var perToken = {};
    var burned = {};
    var cleanly = true;
    var nonClean = false;

    for (var i = 0; i < ordered.length; i++) {
      var t = ordered[i];
      var r = assignBasic(t.value, outputs, nextStart, customActive);
      var ok = r[0], idxs = r[1], remaining = r[2];
      if (!ok) { cleanly = false; }

      if (!customActive) {
        if (ok && idxs.length > 0) {
          log("Token " + t.id + " (" + t.value + " units) exactly covers output" + plural(idxs) +
            ", starting the search at output " + nextStart + ".");
          nextStart = idxs[idxs.length - 1] + 1;
          perToken[t.id] = { idxs: idxs, total: t.value };
        } else {
          log("Token " + t.id + " cannot be placed cleanly from output " + nextStart +
            " (before height 848484 an output had to be covered exactly). Rule C7 applies: every token restarts from output 0.", "burn");
          nonClean = true;
          perToken = {};
          break;
        }
      } else {
        if (remaining > 0) {
          burned[t.id] = (burned[t.id] || 0) + remaining;
          log("Token " + t.id + ": " + remaining + " unit" + (remaining === 1 ? "" : "s") +
            " exceed the satoshis available in the remaining outputs. They burn.", "burn");
        }
        if (idxs.length > 0) {
          log("Token " + t.id + " (" + t.value + " units) colors output" + plural(idxs) +
            ", starting the search at output " + nextStart + ".");
          nextStart = idxs[idxs.length - 1] + 1;
          perToken[t.id] = { idxs: idxs, total: t.value };
        } else {
          log("Token " + t.id + " found no colorable output at or after output " + nextStart +
            ". Rule C7 applies: every token restarts from output 0.", "burn");
          nonClean = true;
          perToken = {};
          break;
        }
      }
    }

    if (nonClean) {
      burned = {};
      ordered.forEach(function (t) {
        var r = assignBasic(t.value, outputs, 0, customActive);
        perToken[t.id] = { idxs: r[1], total: t.value };
        if (r[2] > 0) {
          burned[t.id] = r[2];
          log("Fallback: token " + t.id + " assigns from output 0; " + r[2] +
            " unit" + (r[2] === 1 ? "" : "s") + " burn.", "burn");
        } else {
          log("Fallback: token " + t.id + " assigns from output 0" +
            (r[1].length ? " onto output" + plural(r[1]) : "") + ".");
        }
        if (!r[0]) { cleanly = false; }
      });
      log("In the fallback every token starts at output 0, so several tokens can end up colouring the same outputs.", "burn");
    }

    return finish(perToken, outputs, burned, cleanly, customActive, false);
  }

  /* color_ft_atomicals_split, the y operation. */
  function colorSplit(tokens, outputs, skips, customActive, log) {
    var perToken = {};
    var burned = {};
    var cleanly = true;

    tokens.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; }).forEach(function (t) {
      var skip = skips[t.id] || 0;
      if (skip > 0) {
        log("Token " + t.id + ": skipping outputs until " + skip + " satoshis of output value have been passed over.");
      }
      var remaining = t.value;
      var skipped = 0;
      var idxs = [];
      var partials = {};
      var stopped = false;

      for (var i = 0; i < outputs.length && !stopped; i++) {
        var out = outputs[i];
        if (skip > 0 && skipped < skip) {
          skipped += out.sats;
          log("Token " + t.id + ": output " + i + " (" + out.sats + " sats) skipped (" +
            Math.min(skipped, skip) + " of " + skip + ").");
          continue;
        }
        if (customActive) {
          idxs.push(i);
          var expected = out.sats <= remaining ? out.sats : remaining;
          partials[i] = expected;
          remaining -= out.sats;
          log("Token " + t.id + ": output " + i + " colored with " + expected + " unit" + (expected === 1 ? "" : "s") + ".");
          if (remaining === 0) { stopped = true; }
          else if (remaining < 0) { remaining = 0; cleanly = false; stopped = true; }
        } else {
          if (out.sats <= remaining) {
            idxs.push(i);
            partials[i] = out.sats;
            remaining -= out.sats;
            log("Token " + t.id + ": output " + i + " colored with " + out.sats + " units.");
            if (remaining === 0) { stopped = true; }
          } else {
            cleanly = false;
            burned[t.id] = remaining;
            log("Token " + t.id + ": output " + i + " (" + out.sats + " sats) is larger than the remaining " +
              remaining + " unit" + (remaining === 1 ? "" : "s") + ". The remainder burns.", "burn");
            remaining = 0;
            stopped = true;
          }
        }
      }
      if (remaining > 0 && !(t.id in burned)) {
        cleanly = false;
        burned[t.id] = remaining;
        log("Token " + t.id + ": " + remaining + " unit" + (remaining === 1 ? "" : "s") +
          " remain with no output left to take them. They burn.", "burn");
      }
      perToken[t.id] = { idxs: idxs, partials: partials, total: t.value };
    });

    return finish(perToken, outputs, burned, cleanly, customActive, true);
  }

  /* custom_color_ft_atomicals, the z operation. */
  function colorCustom(tokens, outputs, plan, log) {
    var perToken = {};
    var burned = {};
    var cleanly = true;

    tokens.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; }).forEach(function (t) {
      var remaining = t.value;
      var map = plan[t.id] || {};
      var idxs = [];
      var partials = {};
      for (var i = 0; i < outputs.length; i++) {
        var expected = map[i] || 0;
        if (expected <= 0 || remaining <= 0) { continue; }
        if (expected > outputs[i].sats) {
          log("Token " + t.id + ": the payload asks for " + expected + " units on output " + i +
            " but that output holds only " + outputs[i].sats + " sats. Clamped to " + outputs[i].sats + ".");
          expected = outputs[i].sats;
        }
        if (expected > remaining) {
          log("Token " + t.id + ": the payload asks for more than the " + remaining +
            " unit" + (remaining === 1 ? "" : "s") + " still unassigned. Clamped to " + remaining + ".");
          expected = remaining;
        }
        if (expected < outputs[i].sats) { cleanly = false; }
        idxs.push(i);
        partials[i] = expected;
        remaining -= expected;
        log("Token " + t.id + ": output " + i + " colored with " + expected + " unit" + (expected === 1 ? "" : "s") + " by explicit plan.");
      }
      if (remaining > 0) {
        cleanly = false;
        burned[t.id] = remaining;
        log("Token " + t.id + ": " + remaining + " unit" + (remaining === 1 ? "" : "s") +
          " were never assigned by the plan. They burn.", "burn");
      }
      perToken[t.id] = { idxs: idxs, partials: partials, total: t.value };
    });

    return finish(perToken, outputs, burned, cleanly, true, true);
  }

  function finish(perToken, outputs, burned, cleanly, customActive, hasPartials) {
    var table = outputs.map(function (out, i) {
      return { idx: i, sats: out.sats, opReturn: !!out.opReturn, tokens: {} };
    });
    Object.keys(perToken).forEach(function (id) {
      var info = perToken[id];
      if (hasPartials) {
        Object.keys(info.partials || {}).forEach(function (k) {
          table[k].tokens[id] = (table[k].tokens[id] || 0) + info.partials[k];
        });
        return;
      }
      if (!customActive) {
        info.idxs.forEach(function (i) {
          table[i].tokens[id] = (table[i].tokens[id] || 0) + outputs[i].sats;
        });
      } else {
        var left = info.total;
        info.idxs.forEach(function (i) {
          var v = left >= outputs[i].sats ? outputs[i].sats : left;
          if (v < 0) { v = 0; }
          left -= v;
          table[i].tokens[id] = (table[i].tokens[id] || 0) + v;
        });
      }
    });
    return { table: table, burned: burned, cleanly: cleanly };
  }

  function plural(idxs) {
    return idxs.length === 1 ? " " + idxs[0] : "s " + idxs.join(", ");
  }

  /* ---------------- UI ---------------- */

  function $(sel) { return document.querySelector(sel); }
  var inputsBody, outputsBody;

  function rowCount(tbody) { return tbody.querySelectorAll("tr").length; }

  function addInputRow(sats, tokenId, tokenValue) {
    var i = rowCount(inputsBody);
    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td class="num">' + i + "</td>" +
      '<td><input type="number" min="0" step="1" value="' + sats + '" aria-label="Input ' + i + ' satoshi value" data-role="in-sats"></td>' +
      '<td><input type="text" maxlength="12" value="' + tokenId + '" aria-label="Input ' + i + ' token id, blank for none" data-role="in-token"></td>' +
      '<td><input type="number" min="0" step="1" value="' + tokenValue + '" aria-label="Input ' + i + ' token units" data-role="in-value"></td>' +
      '<td><button type="button" class="btn secondary" data-role="del">Remove</button></td>';
    inputsBody.appendChild(tr);
  }

  function addOutputRow(sats, opReturn) {
    var i = rowCount(outputsBody);
    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td class="num">' + i + "</td>" +
      '<td><input type="number" min="0" step="1" value="' + sats + '" aria-label="Output ' + i + ' satoshi value" data-role="out-sats"></td>' +
      '<td><input type="checkbox"' + (opReturn ? " checked" : "") + ' aria-label="Output ' + i + ' is an OP_RETURN, unspendable" data-role="out-opreturn"></td>' +
      '<td><button type="button" class="btn secondary" data-role="del">Remove</button></td>';
    outputsBody.appendChild(tr);
  }

  function renumber(tbody) {
    Array.prototype.forEach.call(tbody.querySelectorAll("tr"), function (tr, i) {
      tr.querySelector("td").textContent = i;
    });
  }

  function collect() {
    var inputs = [];
    Array.prototype.forEach.call(inputsBody.querySelectorAll("tr"), function (tr, i) {
      inputs.push({
        txinIndex: i,
        sats: clampInt(tr.querySelector('[data-role="in-sats"]').value),
        tokenId: (tr.querySelector('[data-role="in-token"]').value || "").trim(),
        tokenValue: clampInt(tr.querySelector('[data-role="in-value"]').value)
      });
    });
    var outputs = [];
    Array.prototype.forEach.call(outputsBody.querySelectorAll("tr"), function (tr) {
      outputs.push({
        sats: clampInt(tr.querySelector('[data-role="out-sats"]').value),
        opReturn: tr.querySelector('[data-role="out-opreturn"]').checked
      });
    });
    return { inputs: inputs, outputs: outputs };
  }

  function clampInt(v) {
    var n = Math.floor(Number(v) || 0);
    if (!isFinite(n) || n < 0) { return 0; }
    if (n > 2100000000000000) { return 2100000000000000; }
    return n;
  }

  function buildTokens(inputs, log) {
    var map = {};
    inputs.forEach(function (inp) {
      if (!inp.tokenId || inp.tokenValue <= 0) { return; }
      if (inp.tokenValue > inp.sats) {
        log("Input " + inp.txinIndex + " declares " + inp.tokenValue + " units on only " + inp.sats +
          " sats. A token value can never exceed the satoshi value (rule C1); treating it as " + inp.sats + ".", "burn");
        inp.tokenValue = inp.sats;
      }
      map[inp.tokenId] = map[inp.tokenId] || { id: inp.tokenId, value: 0, inputs: [] };
      map[inp.tokenId].value += inp.tokenValue;
      map[inp.tokenId].inputs.push(inp.txinIndex);
    });
    var list = Object.keys(map).map(function (k) { return map[k]; });
    list.forEach(function (t) {
      log("Token " + t.id + ": " + t.value + " units enter on input" +
        (t.inputs.length === 1 ? " " : "s ") + t.inputs.join(", ") + ".");
    });
    return list;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function run() {
    var logEl = $("#sim-log");
    var tableEl = $("#sim-table");
    var summaryEl = $("#sim-summary");
    logEl.innerHTML = "";
    tableEl.innerHTML = "";
    summaryEl.innerHTML = "";

    var steps = [];
    function log(text, kind) { steps.push({ text: text, kind: kind }); }

    var data = collect();
    var customActive = $("#sim-era").value === "current";
    var op = $("#sim-op").value;

    function flush() {
      steps.forEach(function (s) {
        var p = document.createElement("p");
        p.className = "sim-step" + (s.kind === "burn" ? " burn" : "");
        p.textContent = s.text;
        logEl.appendChild(p);
      });
    }

    if (!data.outputs.length) {
      summaryEl.innerHTML = '<p class="sim-step burn">Add at least one output. A transaction that spends colored inputs with no outputs sends every unit to the miner fee, burning all of it.</p>';
      return;
    }
    var tokens = buildTokens(data.inputs, log);
    if (!tokens.length) {
      flush();
      summaryEl.innerHTML = '<p class="sim-step">No input carries token color, so this is an ordinary bitcoin transaction and no ARC-20 rules apply.</p>';
      return;
    }
    if (op === "z" && !customActive) {
      summaryEl.innerHTML = '<p class="sim-step burn">The custom coloring operation (z) exists only from activation height 848484. Switch the rule set to current to use it.</p>';
      return;
    }

    log("Rule set: " + (customActive
      ? "current mainnet, height 848484 and later. FIFO ordering, partial coloring of the final output, and the z operation are all active."
      : "height 819181 to 848483. FIFO ordering is active; an output must be covered exactly or the assignment fails."));

    var totalIn = data.inputs.reduce(function (a, b) { return a + b.sats; }, 0);
    var totalOut = data.outputs.reduce(function (a, b) { return a + b.sats; }, 0);
    if (totalOut > totalIn) {
      log("Note: the outputs total " + totalOut + " sats against " + totalIn +
        " sats of input, which no valid Bitcoin transaction can do. The coloring result below is still computed from the shape you entered.", "burn");
    } else if (totalOut < totalIn) {
      log("Miner fee: " + (totalIn - totalOut) + " sats. Any part of that fee taken from colored value is burned token supply.");
    }

    var result;
    if (op === "y") {
      var skips = {};
      tokens.forEach(function (t) {
        var el = document.querySelector('[data-skip="' + cssEscape(t.id) + '"]');
        skips[t.id] = el ? clampInt(el.value) : 0;
      });
      log("Operation: split (y) on input 0. Each token skips a declared amount of output satoshis before its coloring begins.");
      result = colorSplit(tokens, data.outputs, skips, customActive, log);
    } else if (op === "z") {
      var plan = {};
      tokens.forEach(function (t) {
        plan[t.id] = {};
        data.outputs.forEach(function (_o, i) {
          var el = document.querySelector('[data-plan="' + cssEscape(t.id) + ":" + i + '"]');
          var v = el ? clampInt(el.value) : 0;
          if (v > 0) { plan[t.id][i] = v; }
        });
      });
      log("Operation: custom color (z) on input 0. Token value goes only where the payload directs it.");
      result = colorCustom(tokens, data.outputs, plan, log);
    } else {
      log("Operation: none. This is a plain spend of colored UTXOs, so regular assignment applies.");
      result = colorRegular(tokens, data.outputs, true, customActive, log);
    }

    flush();

    var tokenIds = tokens.map(function (t) { return t.id; }).sort();
    var html = '<div class="table-wrap"><table><caption>Resulting outputs</caption><thead><tr><th scope="col">Output</th><th scope="col">Sats</th>';
    tokenIds.forEach(function (id) { html += '<th scope="col">' + escapeHtml(id) + " units</th>"; });
    html += '<th scope="col">Meaning</th></tr></thead><tbody>';
    result.table.forEach(function (row) {
      html += '<tr><td class="num">' + row.idx + '</td><td class="num">' + row.sats + (row.opReturn ? " (OP_RETURN)" : "") + "</td>";
      var carries = [];
      tokenIds.forEach(function (id) {
        var v = row.tokens[id] || 0;
        html += '<td class="num">' + v + "</td>";
        if (v) { carries.push(v + " " + id); }
      });
      var meaning = row.opReturn
        ? "Unspendable, never colored."
        : carries.length
          ? "Carries " + carries.join(" and ") + "."
          : "Plain satoshis, no token color.";
      html += "<td>" + escapeHtml(meaning) + "</td></tr>";
    });
    html += "</tbody></table></div>";
    tableEl.innerHTML = html;

    var burnedIds = Object.keys(result.burned).filter(function (k) { return result.burned[k] > 0; });
    var parts = [];
    parts.push('<p class="sim-step' + (burnedIds.length ? " burn" : "") + '"><strong>' +
      (burnedIds.length ? "Color burned. " : "No color burned. ") + "</strong>" +
      (burnedIds.length
        ? burnedIds.map(function (id) {
            return result.burned[id] + " unit" + (result.burned[id] === 1 ? "" : "s") + " of " + escapeHtml(id);
          }).join(", ") +
          " left the token supply permanently. No output satisfied the rules for that value, and burned value never returns."
        : "Every token unit that entered on the inputs was assigned to an output.") + "</p>");
    parts.push('<p class="sim-step">Cleanly assigned: <strong>' + (result.cleanly ? "yes" : "no") + "</strong>. " +
      (result.cleanly
        ? "Each colored output's satoshi value is matched exactly by token value."
        : "At least one output is partially colored or a token did not land on output boundaries. This is legal, but it is the shape that surprises people, so verify it before signing.") + "</p>");
    summaryEl.innerHTML = parts.join("");
  }

  function cssEscape(s) {
    return String(s).replace(/["\\]/g, "\\$&");
  }

  function refreshOpFields() {
    var op = $("#sim-op").value;
    var host = $("#sim-op-fields");
    host.innerHTML = "";
    var data = collect();
    var ids = [];
    data.inputs.forEach(function (i) {
      if (i.tokenId && i.tokenValue > 0 && ids.indexOf(i.tokenId) === -1) { ids.push(i.tokenId); }
    });
    ids.sort();
    if (!ids.length) { return; }

    if (op === "y") {
      ids.forEach(function (id) {
        var div = document.createElement("div");
        div.innerHTML = "<label>Skip amount for " + escapeHtml(id) + " (sats)" +
          '<input type="number" min="0" step="1" value="0" data-skip="' + escapeHtml(id) + '"></label>';
        host.appendChild(div);
      });
      var p = document.createElement("p");
      p.style.fontSize = "0.85rem";
      p.style.flexBasis = "100%";
      p.textContent = "The split payload maps each token id to a satoshi amount to pass over before coloring starts for that token.";
      host.appendChild(p);
    } else if (op === "z") {
      ids.forEach(function (id) {
        data.outputs.forEach(function (_o, i) {
          var div = document.createElement("div");
          div.innerHTML = "<label>" + escapeHtml(id) + " units on output " + i +
            '<input type="number" min="0" step="1" value="0" data-plan="' + escapeHtml(id) + ":" + i + '"></label>';
          host.appendChild(div);
        });
      });
      var q = document.createElement("p");
      q.style.fontSize = "0.85rem";
      q.style.flexBasis = "100%";
      q.textContent = "The z payload maps each token id to explicit output values. Values are clamped to the output's satoshis and to the remaining token value; anything left unassigned burns.";
      host.appendChild(q);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var mount = $("#sim-app");
    if (!mount) { return; }
    mount.hidden = false;
    var ns = $("#sim-noscript-hint");
    if (ns) { ns.hidden = true; }

    inputsBody = document.querySelector("#sim-inputs tbody");
    outputsBody = document.querySelector("#sim-outputs tbody");

    /* Default scenario: one colored input paid into two outputs, fee taken
       from colored value so the burn behavior is visible immediately. */
    addInputRow(10000, "QUARK", 10000);
    addOutputRow(3000, false);
    addOutputRow(6800, false);

    $("#sim-add-input").addEventListener("click", function () { addInputRow(546, "", 0); refreshOpFields(); });
    $("#sim-add-output").addEventListener("click", function () { addOutputRow(546, false); refreshOpFields(); });
    mount.addEventListener("click", function (ev) {
      var target = ev.target;
      if (target && target.getAttribute && target.getAttribute("data-role") === "del") {
        var tr = target.parentElement.parentElement;
        var tbody = tr.parentElement;
        if (tbody.querySelectorAll("tr").length <= 1) { return; }
        tbody.removeChild(tr);
        renumber(tbody);
        refreshOpFields();
      }
    });
    $("#sim-op").addEventListener("change", refreshOpFields);
    inputsBody.addEventListener("change", refreshOpFields);
    outputsBody.addEventListener("change", refreshOpFields);
    $("#sim-run").addEventListener("click", run);
    refreshOpFields();
    run();
  });
})();
