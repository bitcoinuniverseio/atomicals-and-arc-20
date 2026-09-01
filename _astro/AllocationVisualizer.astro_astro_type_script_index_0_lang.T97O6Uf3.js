import{t as e}from"./allocation.COcdl4OS.js";var t=class extends HTMLElement{#e=[];#t=[];#n=[];connectedCallback(){try{this.#e=JSON.parse(this.dataset.presets??`[]`)}catch{this.#e=[]}this.querySelector(`[data-preset]`)?.addEventListener(`change`,e=>{let t=e.currentTarget.value,n=this.#e.find(e=>e.id===t);if(n){this.#t=n.inputs.map(e=>({...e})),this.#n=n.outputs.map(e=>({...e}));let e=this.querySelector(`[data-ordering]`),t=this.querySelector(`[data-custom]`);e&&(e.value=n.options.sortByFifo===!1?`legacy`:`fifo`),t&&(t.value=n.options.customColoring?`on`:`off`)}else this.#t=[{atomicalId:`TOKENA`,txinIndex:0,atomicalValue:1200}],this.#n=[{value:700},{value:500}];this.#r(),this.#o()}),this.querySelector(`[data-add-input]`)?.addEventListener(`click`,()=>{this.#t.push({atomicalId:`TOKENA`,txinIndex:this.#t.length,atomicalValue:546}),this.#r(),this.#o()}),this.querySelector(`[data-add-output]`)?.addEventListener(`click`,()=>{this.#n.push({value:546}),this.#r(),this.#o()});for(let e of[`[data-ordering]`,`[data-custom]`])this.querySelector(e)?.addEventListener(`change`,()=>this.#o());this.querySelector(`[data-copy-vector]`)?.addEventListener(`click`,()=>{this.#s()}),this.#t=[{atomicalId:`TOKENA`,txinIndex:0,atomicalValue:1200}],this.#n=[{value:700},{value:546}],this.#r(),this.#o()}#r(){let e=this.querySelector(`[data-inputs]`),t=this.querySelector(`[data-outputs]`);if(!(!e||!t)){e.replaceChildren(...this.#t.map((e,t)=>{let n=document.createElement(`div`);return n.className=`bu-row`,n.innerHTML=`
            <div class="bu-field">
              <label for="in-token-${t}">Token</label>
              <input id="in-token-${t}" type="text" value="${r(e.atomicalId)}" data-field="atomicalId" data-index="${t}" data-kind="input" />
            </div>
            <div class="bu-field">
              <label for="in-idx-${t}">Input index</label>
              <input id="in-idx-${t}" type="number" min="0" step="1" value="${e.txinIndex}" data-field="txinIndex" data-index="${t}" data-kind="input" />
            </div>
            <div class="bu-field">
              <label for="in-val-${t}">Units</label>
              <input id="in-val-${t}" type="number" min="0" step="1" value="${e.atomicalValue}" data-field="atomicalValue" data-index="${t}" data-kind="input" />
            </div>
            <button type="button" class="bu-btn" data-remove="input" data-index="${t}">Remove</button>
          `,n})),t.replaceChildren(...this.#n.map((e,t)=>{let n=document.createElement(`div`);return n.className=`bu-row`,n.innerHTML=`
            <div class="bu-field">
              <label for="out-val-${t}">Output ${t}, satoshis</label>
              <input id="out-val-${t}" type="number" min="0" step="1" value="${e.value}" data-field="value" data-index="${t}" data-kind="output" />
            </div>
            <div class="bu-field">
              <label for="out-uns-${t}">Unspendable</label>
              <select id="out-uns-${t}" data-field="unspendable" data-index="${t}" data-kind="output">
                <option value="no"${e.unspendable?``:` selected`}>No</option>
                <option value="yes"${e.unspendable?` selected`:``}>Yes</option>
              </select>
            </div>
            <button type="button" class="bu-btn" data-remove="output" data-index="${t}">Remove</button>
          `,n}));for(let e of this.querySelectorAll(`[data-field]`))e.addEventListener(`input`,e=>this.#i(e)),e.addEventListener(`change`,e=>this.#i(e));for(let e of this.querySelectorAll(`[data-remove]`))e.addEventListener(`click`,e=>{let t=e.currentTarget,n=Number(t.dataset.index);t.dataset.remove===`input`?this.#t.splice(n,1):this.#n.splice(n,1),this.#r(),this.#o()})}}#i(e){let t=e.currentTarget,n=Number(t.dataset.index),r=t.dataset.field;if(t.dataset.kind===`input`){let e=this.#t[n];if(!e||!r)return;r===`atomicalId`?e.atomicalId=t.value.trim()||`TOKENA`:e[r]=Math.max(0,Number(t.value)||0)}else{let e=this.#n[n];if(!e||!r)return;r===`unspendable`?e.unspendable=t.value===`yes`:e.value=Math.max(0,Number(t.value)||0)}this.#o()}#a(){let e=this.querySelector(`[data-ordering]`)?.value,t=this.querySelector(`[data-custom]`)?.value;return{sortByFifo:e!==`legacy`,customColoring:t===`on`}}#o(){let t=this.querySelector(`[data-result]`),r=this.querySelector(`[data-error]`);if(!t||!r)return;if(this.#t.length===0||this.#n.length===0){r.hidden=!1,r.textContent=`Add at least one coloured input and one output.`,t.replaceChildren();return}r.hidden=!0;let i=e(this.#n,this.#t,this.#a()),a=this.#t.reduce((e,t)=>e+t.atomicalValue,0),o=i.outputs.reduce((e,t)=>e+t.coloredTotal,0),s=i.burned.reduce((e,t)=>e+t.value,0);t.innerHTML=`
        <table>
          <caption class="sr-only">Computed allocation</caption>
          <thead>
            <tr>
              <th scope="col">Output</th>
              <th scope="col">Satoshis</th>
              <th scope="col">Units received</th>
              <th scope="col">Assigned to</th>
            </tr>
          </thead>
          <tbody>${i.outputs.map(e=>`
            <tr>
              <th scope="row">output ${e.index}</th>
              <td class="bu-num">${e.value}</td>
              <td class="bu-num">${e.coloredTotal}</td>
              <td>${e.unspendable?`unspendable, skipped`:e.assignments.map(e=>n(e.atomicalId)).join(`, `)||`nothing`}</td>
            </tr>`).join(``)}</tbody>
        </table>
        <dl class="bu-facts" style="margin-top:1rem">
          <div class="bu-fact"><dt>Coloured in</dt><dd>${a}</dd></div>
          <div class="bu-fact"><dt>Placed</dt><dd>${o}</dd></div>
          <div class="bu-fact"><dt>Burned</dt><dd>${s}</dd></div>
        </dl>
        <p>
          <span class="bu-chip" data-tone="${s>0?`risk`:`ok`}">
            ${s>0?`${s} units destroyed`:`nothing burned`}
          </span>
          <span class="bu-chip" data-tone="${i.cleanlyAssigned?`ok`:`warn`}">
            ${i.cleanlyAssigned?`cleanly assigned`:`not cleanly assigned`}
          </span>
          ${i.inflationRejected?`<span class="bu-chip" data-tone="risk">inflation rejected</span>`:``}
        </p>
      `}async#s(){let t={options:this.#a(),inputs:this.#t,outputs:this.#n,expected:e(this.#n,this.#t,this.#a())},n=this.querySelector(`[data-copy-vector]`);try{await navigator.clipboard.writeText(JSON.stringify(t,null,2)),n.textContent=`Copied`}catch{n.textContent=`Copy failed`}window.setTimeout(()=>{n.textContent=`Copy as a vector`},2400)}};function n(e){return e.replace(/[&<>"']/g,e=>({"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#39;`})[e]??e)}var r=n;customElements.define(`bu-allocation`,t);