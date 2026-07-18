import { css } from "lit";

// Mirrors the custom properties defined in styles/base.css. Values are read
// via var() with no fallback: base.css is assumed to always be present.
export const colorBullet = css`var(--color-bullet)`;
