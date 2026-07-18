import { LitElement, html, css } from "lit";

export class LinkList extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-top: 0;
    }
    ::slotted(a) {
      display: block;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("link-list", LinkList);
