/**
 * Language registry. `id` matches the Monaco language id; `extension` drives
 * file downloads. `plaintext` is the default.
 */
export interface SnippetLanguage {
  id: string;
  label: string;
  extension: string;
}

const PLAINTEXT: SnippetLanguage = { id: "plaintext", label: "Plain text", extension: "txt" };

export const SNIPPET_LANGUAGES: readonly SnippetLanguage[] = [
  PLAINTEXT,
  { id: "javascript", label: "JavaScript", extension: "js" },
  { id: "typescript", label: "TypeScript", extension: "ts" },
  { id: "jsx", label: "JSX", extension: "jsx" },
  { id: "tsx", label: "TSX", extension: "tsx" },
  { id: "json", label: "JSON", extension: "json" },
  { id: "html", label: "HTML", extension: "html" },
  { id: "css", label: "CSS", extension: "css" },
  { id: "python", label: "Python", extension: "py" },
  { id: "java", label: "Java", extension: "java" },
  { id: "csharp", label: "C#", extension: "cs" },
  { id: "cpp", label: "C++", extension: "cpp" },
  { id: "c", label: "C", extension: "c" },
  { id: "go", label: "Go", extension: "go" },
  { id: "rust", label: "Rust", extension: "rs" },
  { id: "ruby", label: "Ruby", extension: "rb" },
  { id: "php", label: "PHP", extension: "php" },
  { id: "sql", label: "SQL", extension: "sql" },
  { id: "yaml", label: "YAML", extension: "yaml" },
  { id: "markdown", label: "Markdown", extension: "md" },
  { id: "shell", label: "Shell", extension: "sh" },
  { id: "dockerfile", label: "Dockerfile", extension: "dockerfile" },
];

export const DEFAULT_LANGUAGE = "plaintext";

const LANGUAGE_BY_ID = new Map(SNIPPET_LANGUAGES.map((language) => [language.id, language]));

export function getLanguage(id: string | null | undefined): SnippetLanguage {
  if (!id) return PLAINTEXT;
  return LANGUAGE_BY_ID.get(id) ?? PLAINTEXT;
}

export function getLanguageLabel(id: string | null | undefined): string {
  return getLanguage(id).label;
}
