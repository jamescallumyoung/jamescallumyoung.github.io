import { LitElement, html, css } from "lit";

export class PageHeader extends LitElement {
  static styles = css`
    :host {
      display: flex;
      justify-content: space-between;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("page-header", PageHeader);
