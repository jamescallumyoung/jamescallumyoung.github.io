import { LitElement, html, css } from "lit";

export class ContentList extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("content-list", ContentList);
