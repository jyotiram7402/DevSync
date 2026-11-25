import Link from "next/link";

import { DuplicatePad } from "@/components/sections/duplicate-pad";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * Hero. The whole first screen is a duplicate pad on a canary ground: the
 * headline is printed across the white original and the pink copy, and the
 * pad works (see DuplicatePad). What the product is and the way in sit beside
 * it.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="sheet-canary">
      <Container className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12 lg:pb-28 lg:pt-14">
        <DuplicatePad>
          <p className="text-pretty text-lg sm:text-xl sm:leading-8">
            CopyAnywhere is a clipboard that follows you from device to device. Save something on
            one, and it&apos;s on your others about a second later.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto lg:w-full xl:w-auto">
                <Link href="/signup">Get started free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto lg:w-full xl:w-auto"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free. It&apos;s a website, so there&apos;s nothing to install.
            </p>
          </div>
        </DuplicatePad>
      </Container>
    </section>
  );
}
