import{t as e}from"./allocation.COcdl4OS.js";var t=class{#e;#t=0;constructor(e){this.#e=e}get offset(){return this.#t}get remaining(){return this.#e.length-this.#t}u8(){if(this.remaining<1)throw Error(`unexpected end of data`);return this.#e[this.#t++]}read(e){if(e<0||this.remaining<e)throw Error(`unexpected end of data`);let t=this.#e.subarray(this.#t,this.#t+e);return this.#t+=e,t}u32(){let e=this.read(4);return(e[0]|e[1]<<8|e[2]<<16|e[3]<<24)>>>0}u64(){let e=this.read(8),t=0n;for(let n=7;n>=0;--n)t=t<<8n|BigInt(e[n]);return t}varint(){let e=this.u8();if(e<253)return e;if(e===253){let e=this.read(2);return e[0]|e[1]<<8}if(e===254)return this.u32();let t=this.u64();if(t>BigInt(2**53-1))throw Error(`length out of range`);return Number(t)}};function n(e){let t=e.trim().replace(/\s+/g,``);if(!t)throw Error(`Nothing to parse.`);if(/^[0-9a-fA-F]+$/.test(t)&&t.length%2==0){let e=new Uint8Array(t.length/2);for(let n=0;n<e.length;n+=1)e[n]=Number.parseInt(t.slice(n*2,n*2+2),16);return e}if(/^[A-Za-z0-9+/=]+$/.test(t)){let e=atob(t),n=new Uint8Array(e.length);for(let t=0;t<e.length;t+=1)n[t]=e.charCodeAt(t);return n}throw Error(`Input is neither hex nor base64.`)}var r=[112,115,98,116,255];function i(e){return r.every((t,n)=>e[n]===t)}function a(e){let n=new t(e);n.read(5);let r=null,i=[];for(;;){let e=n.varint();if(e===0)break;let t=n.read(e),i=n.varint(),a=n.read(i);t[0]===0&&(r=a.slice())}for(;n.remaining>0;){for(;n.remaining!==0;){let e=n.varint();if(e===0)break;let t=n.read(e),r=n.varint(),a=n.read(r);t[0]===3&&a.length===4&&i.push((a[0]|a[1]<<8|a[2]<<16|a[3]<<24)>>>0)}if(i.length>0&&n.remaining<2||n.remaining===0)break}if(!r)throw Error(`PSBT carries no unsigned transaction.`);return{tx:r,sighashTypes:i}}function o(e){return e.length===0?`empty`:e[0]===106?`OP_RETURN, unspendable`:e.length===22&&e[0]===0&&e[1]===20?`P2WPKH`:e.length===34&&e[0]===0&&e[1]===32?`P2WSH`:e.length===34&&e[0]===81&&e[1]===32?`P2TR`:e.length===25&&e[0]===118&&e[1]===169?`P2PKH`:e.length===23&&e[0]===169?`P2SH`:`unrecognised`}function s(e){return[...e].map(e=>e.toString(16).padStart(2,`0`)).join(``)}function c(e){let n=new t(e),r=n.u32(),i=n.varint(),a=!1;if(i===0){if(n.u8()!==1)throw Error(`unrecognised segwit flag`);a=!0,i=n.varint()}let c=[];for(let e=0;e<i;e+=1){let t=n.read(32),r=n.u32(),i=n.varint();n.read(i);let a=n.u32();c.push({index:e,txid:s(t.slice().reverse()),vout:r,sequence:a})}let l=n.varint(),u=[];for(let e=0;e<l;e+=1){let t=Number(n.u64()),r=n.varint(),i=n.read(r);u.push({index:e,value:t,scriptHex:s(i),kind:o(i)})}return{version:r,segwit:a,inputs:c,outputs:u}}var l={1:`SIGHASH_ALL`,2:`SIGHASH_NONE`,3:`SIGHASH_SINGLE`,129:`SIGHASH_ALL with ANYONECANPAY`,130:`SIGHASH_NONE with ANYONECANPAY`,131:`SIGHASH_SINGLE with ANYONECANPAY`},u=class extends HTMLElement{connectedCallback(){this.querySelector(`[data-inspect]`)?.addEventListener(`click`,()=>this.#e())}#e(){let t=this.querySelector(`[data-hex]`),r=this.querySelector(`[data-colored]`),o=this.querySelector(`[data-error]`),s=this.querySelector(`[data-result]`);if(!t||!s||!o)return;o.hidden=!0,t.removeAttribute(`aria-invalid`);let u,d=[],f=`raw transaction`;try{let e=n(t.value);if(i(e)){f=`PSBT`;let t=a(e);d=t.sighashTypes,u=c(t.tx)}else u=c(e)}catch(e){o.hidden=!1,o.textContent=`Could not parse this input: ${e.message}. Nothing was sent anywhere.`,t.setAttribute(`aria-invalid`,`true`),s.innerHTML=`<p>Nothing to show. The input could not be parsed.</p>`;return}let p=[];for(let e of r.value.split(/\n+/)){let t=e.trim().match(/^(\d+)\s*:\s*(\d+)$/);t&&p.push({atomicalId:`INPUT_${t[1]}`,txinIndex:Number(t[1]),atomicalValue:Number(t[2])})}let m=u.outputs.map(e=>({value:e.value,unspendable:e.kind===`OP_RETURN, unspendable`})),h=p.length>0?e(m,p):null,g=h?.burned.reduce((e,t)=>e+t.value,0)??0,_=u.inputs.map(e=>`
            <tr>
              <th scope="row">in ${e.index}</th>
              <td><code>${e.txid.slice(0,12)}...:${e.vout}</code></td>
              <td class="bu-num">${e.sequence===4294967293?`0xfffffffd, replaceable`:`0x${e.sequence.toString(16)}`}</td>
              <td>${p.some(t=>t.txinIndex===e.index)?`<span class="bu-chip" data-tone="warn">declared coloured</span>`:`<span class="bu-chip" data-tone="idle">unknown</span>`}</td>
            </tr>`).join(``),v=u.outputs.map(e=>{let t=h?.outputs[e.index];return`
            <tr>
              <th scope="row">out ${e.index}</th>
              <td class="bu-num">${e.value}</td>
              <td>${e.kind}</td>
              <td class="bu-num">${t?t.coloredTotal:`unknown`}</td>
            </tr>`}).join(``),y=d.length?d.map((e,t)=>`<li>input ${t}: <code>0x${e.toString(16)}</code> ${l[e]??`unrecognised, treat as unknown`}</li>`).join(``):`<li>No signature hash type was declared in this input. That is unknown, not safe.</li>`;s.innerHTML=`
        <p>
          <span class="bu-chip" data-tone="protocol">${f}</span>
          <span class="bu-chip" data-tone="idle">version ${u.version}</span>
          ${u.segwit?`<span class="bu-chip" data-tone="idle">segwit</span>`:``}
        </p>

        <h4>Inputs</h4>
        <table>
          <thead><tr><th scope="col">Input</th><th scope="col">Outpoint</th><th scope="col">Sequence</th><th scope="col">Coloured</th></tr></thead>
          <tbody>${_}</tbody>
        </table>

        <h4>Outputs, in order</h4>
        <table>
          <thead><tr><th scope="col">Output</th><th scope="col">Satoshis</th><th scope="col">Script</th><th scope="col">Units</th></tr></thead>
          <tbody>${v}</tbody>
        </table>

        <h4>Signature scope</h4>
        <ul>${y}</ul>

        <h4>Assessment</h4>
        <p>
          ${h?`<span class="bu-chip" data-tone="${g>0?`risk`:`ok`}">${g>0?`${g} units would burn`:`no burn under normal allocation`}</span>`:`<span class="bu-chip" data-tone="idle">coloured state unknown, supply it above</span>`}
        </p>
        <ul>
          <li>Coloured state of an input is only known if you supplied it. The inspector does not query any service.</li>
          <li>Output values are what allocation walks. Compare each one to your intent, in satoshis.</li>
          <li>An unrecognised script kind is unknown, not safe.</li>
          <li>Only the active validator decides the real result. This is explanatory.</li>
        </ul>
      `}};customElements.define(`bu-tx-inspector`,u);