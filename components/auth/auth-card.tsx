import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

/**
 * Card wrapper for auth screens. Renders the page heading as an <h1> for
 * correct document semantics, an optional description, the form/body, and an
 * optional footer (e.g. cross-links).
 */
interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">{children}</CardContent>
      {footer ? (
        <div className="px-6 pb-6 text-center text-sm text-muted-foreground">{footer}</div>
      ) : null}
    </Card>
  );
}
