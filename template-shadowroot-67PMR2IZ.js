var r;function s(){var n;return r===void 0&&(r=!!(!((n=new DOMParser().parseFromString('<div><template shadowrootmode="open"></template></div>',"text/html",{includeShadowRoots:!0}).querySelector("div"))===null||n===void 0)&&n.shadowRoot)),r}var d=n=>n.parentElement===null,m=n=>n.tagName==="TEMPLATE",h=n=>n.nodeType===Node.ELEMENT_NODE;var p=n=>{var l;if(s())return;let i=[],e=n.firstElementChild;for(;e!==n&&e!==null;)if(m(e))i.push(e),e=e.content;else if(e.firstElementChild!==null)e=e.firstElementChild;else if(h(e)&&e.nextElementSibling!==null)e=e.nextElementSibling;else{let t;for(;e!==n&&e!==null;)if(d(e)){t=i.pop();let a=t.parentElement,o=t.getAttribute("shadowrootmode");if(e=t,o==="open"||o==="closed"){let f=t.hasAttribute("shadowrootdelegatesfocus");try{a.attachShadow({mode:o,delegatesFocus:f}).append(t.content)}catch{}}else t=void 0}else{let a=e.nextElementSibling;if(a!=null){e=a,t!==void 0&&t.parentElement.removeChild(t);break}let o=(l=e.parentElement)===null||l===void 0?void 0:l.nextElementSibling;if(o!=null){e=o,t!==void 0&&t.parentElement.removeChild(t);break}e=e.parentElement,t!==void 0&&(t.parentElement.removeChild(t),t=void 0)}}};export{s as hasNativeDeclarativeShadowRoots,p as hydrateShadowRoots};
/*! Bundled license information:

@webcomponents/template-shadowroot/_implementation/feature_detect.js:
@webcomponents/template-shadowroot/_implementation/default_implementation.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@webcomponents/template-shadowroot/_implementation/util.js:
@webcomponents/template-shadowroot/_implementation/manual_walk.js:
@webcomponents/template-shadowroot/template-shadowroot.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
