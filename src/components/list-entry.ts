import { LitElement, html, css } from "lit";
import { colorBullet } from "../styles/tokens.js";

export class ListEntry extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin-left: 3ex;
    }
    :host::before {
      content: "*\\00a0 ";
      display: block;
      margin-left: -3ex;
      color: ${colorBullet};
      float: left;
    }
  `;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("list-entry", ListEntry);
