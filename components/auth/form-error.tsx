/**
 * Accessible, form-level error banner. Announced to assistive tech via
 * role="alert". Used across the auth forms for non-field errors.
 */
export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}
