/** The "or" line between the Google/GitHub buttons and the email form. */
export function OrDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground" aria-hidden="true">
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
