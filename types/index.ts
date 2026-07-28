/**
 * Shared, cross-cutting TypeScript types and helpers.
 *
 * Only genuinely app-wide types live here; feature-owned types stay in their
 * feature module. Re-exports below give a single import surface for common
 * shared types.
 */

/** A value that may be `null`. */
export type Nullable<T> = T | null;

/** A value that may be `null` or `undefined`. */
export type Maybe<T> = T | null | undefined;

/** Forces an editor/compiler to expand a mapped/intersection type for readability. */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** The union of a type's property value types. */
export type ValueOf<T> = T[keyof T];

/** The awaited return type of an async function. */
export type AsyncReturnType<T extends (...args: never[]) => Promise<unknown>> = Awaited<
  ReturnType<T>
>;

export * from "@/types/api";
