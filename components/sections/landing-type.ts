/**
 * Type styles shared by the landing page sections, so every sheet of the pad
 * is set the same way.
 */

/** The pair of words printed across the two sheets in the hero. */
export const DISPLAY =
  "text-[clamp(2.75rem,7.2vw,5.75rem)] font-black leading-[0.94] tracking-[-0.035em]";

/** Section headings. */
export const HEADING =
  "text-balance text-4xl font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl";

/** The paragraph under a section heading. */
export const LEAD =
  "max-w-[34rem] text-pretty text-lg text-muted-foreground sm:text-xl sm:leading-8";

/** Small print along the edge of a sheet, as on a printed form. */
export const EDGE = "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";
