import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Container } from "@/components/shared/container";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { APP_NAME } from "@/lib/constants";
import { SUPPORT_EMAIL } from "@/lib/site-config";

const LAST_UPDATED = "August 20, 2026";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms that govern your use of ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <PageWrapper>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Container className="mx-auto max-w-3xl py-16">
          <h1 className="text-3xl font-semibold tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-8 flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground">
            <section className="flex flex-col gap-3">
              <p>
                These terms govern your use of {APP_NAME}. By creating an account or using the
                service, you agree to them. If you do not agree, please do not use {APP_NAME}.
              </p>
            </section>

            <Section title="The service">
              <p>
                {APP_NAME} lets you save text, code, links, images, documents, and files and sync
                them in real time across your own signed-in devices. Features may change or be added
                over time as the product evolves.
              </p>
            </Section>

            <Section title="Your account">
              <p>
                You are responsible for keeping your login credentials secure and for the activity
                that happens under your account. Use a strong, unique password, and let us know
                promptly if you believe your account has been compromised.
              </p>
            </Section>

            <Section title="Acceptable use">
              <p>You agree not to use {APP_NAME} to:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>store or distribute unlawful, infringing, or malicious content;</li>
                <li>attempt to access another user&apos;s data or disrupt the service;</li>
                <li>circumvent security, rate limits, or storage limits; or</li>
                <li>resell or abuse the service in a way that harms other users.</li>
              </ul>
            </Section>

            <Section title="Your content">
              <p>
                You retain all rights to the content you save. You grant {APP_NAME} only the limited
                permission needed to store, process, and sync that content to your devices so the
                service can function. You are responsible for the content you choose to save.
              </p>
            </Section>

            <Section title="Availability and retention">
              <p>
                {APP_NAME} is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We
                aim for high reliability but do not guarantee uninterrupted service. Items expire
                automatically after a short window unless pinned or favorited, so you should not rely
                on {APP_NAME} as a permanent backup.
              </p>
            </Section>

            <Section title="Limitation of liability">
              <p>
                To the maximum extent permitted by law, {APP_NAME} is not liable for any indirect,
                incidental, or consequential damages, or for any loss of data arising from your use
                of the service. Keep your own copies of anything you cannot afford to lose.
              </p>
            </Section>

            <Section title="Termination">
              <p>
                You may stop using {APP_NAME} and delete your account at any time. We may suspend or
                terminate accounts that violate these terms or that put the service or its users at
                risk.
              </p>
            </Section>

            <Section title="Changes to these terms">
              <p>
                We may update these terms as the service changes. When we do, we will revise the
                &quot;last updated&quot; date above. Continued use after changes means you accept the
                updated terms.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about these terms? Email us at{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </Section>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </PageWrapper>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}
