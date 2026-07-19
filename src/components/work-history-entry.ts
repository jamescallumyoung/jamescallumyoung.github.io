import { LitElement, html } from "lit";
import { bulletEntryStyles } from "../styles/tokens.js";

// "YYYY/MM" and "current" are both 7 characters, so padding every date to
// this width lines up the separating dash at character 9 and the title at
// character 20 regardless of which date format an entry uses (some are
// year-only, e.g. "2016").
const DATE_FIELD_WIDTH = 7;
const DATE_SEGMENT_WIDTH = 17; // date + space-dash-space + date

// A real space would collapse in normal HTML text flow the moment it's
// adjacent to another one, silently destroying the padding this exists to
// produce -- a non-breaking space does not.
const NBSP = "\u00A0";

export class WorkHistoryEntry extends LitElement {
  static styles = bulletEntryStyles;

  static properties = {
    startDate: { attribute: "start-date" },
    endDate: { attribute: "end-date" },
    current: { type: Boolean },
    title: {},
    company: {},
  };

  declare startDate: string | null;
  declare endDate: string | null;
  declare current: boolean;
  declare title: string;
  declare company: string | null;

  constructor() {
    super();
    this.current = false;
  }

  render() {
    const start = (this.startDate || "").padEnd(DATE_FIELD_WIDTH, NBSP);
    const end = (this.endDate || (this.current && "current") || "").padEnd(DATE_FIELD_WIDTH, NBSP);
    
    const dateInner = `${start}${(this.endDate || this.current) ? " - " : ""}${end}`.padEnd(DATE_SEGMENT_WIDTH, NBSP);
    const dateSegment = ((this.startDate || this.endDate) ? `${dateInner}: ` : ""); //.padEnd(DATE_SEGMENT_WIDTH+2, NBSP);

    const companySegment = (this.company ? `, ${this.company}` : "");
    
    return html`${dateSegment}${this.title}${companySegment}`;
  }
}

customElements.define("work-history-entry", WorkHistoryEntry);
