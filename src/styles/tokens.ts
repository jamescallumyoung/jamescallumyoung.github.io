import { css } from "lit";

// Mirrors the custom properties defined in styles/base.css. Values are read
// via var() with no fallback: base.css is assumed to always be present.
export const colorBullet = css`var(--color-bullet)`;

// Shared "* " bullet-marker treatment for any component that behaves like a
// list entry (list-entry, work-history-entry). Kept in one place so the two
// stay visually identical.
export const bulletEntryStyles = css`
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
