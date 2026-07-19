import { LitElement, html } from "lit";
import { bulletEntryStyles } from "../styles/tokens.js";

export class ListEntry extends LitElement {
  static styles = bulletEntryStyles;

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("list-entry", ListEntry);
