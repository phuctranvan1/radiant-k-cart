import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policy")({
  head: () => ({ meta: [{ title: "Policies — GLOW" }] }),
  component: PolicyPage,
});

function PolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">LEGAL</p>
        <h1 className="font-display text-5xl">Policies</h1>
      </div>

      <article className="prose prose-invert max-w-none space-y-10">
        <section>
          <h2 className="font-display text-3xl text-gold">Shipping</h2>
          <p className="text-muted-foreground">
            We ship worldwide to over 80 countries. Standard shipping (5–10 business days) is free
            on orders over $80; otherwise $10 flat. Express shipping (3–5 days) available at
            checkout.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-gold">Returns</h2>
          <p className="text-muted-foreground">
            Unopened items may be returned within 30 days of delivery for a full refund. Items must
            be in original packaging. Opened skincare cannot be returned for hygiene reasons.
            Refunds processed within 5–7 business days of receipt.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-gold">Privacy</h2>
          <p className="text-muted-foreground">
            We collect only what we need to fulfill orders and improve your experience: name, email,
            shipping address, and order history. We never sell your data. Read our full privacy
            notice for details on cookies, analytics, and third-party processors.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-gold">Terms of Service</h2>
          <p className="text-muted-foreground">
            By using GLOW, you agree to use the site lawfully, provide accurate information, and
            respect our intellectual property. Prices are subject to change. We reserve the right to
            refuse service for any reason.
          </p>
        </section>
        <section>
          <h2 className="font-display text-3xl text-gold">Authenticity</h2>
          <p className="text-muted-foreground">
            Every product is sourced directly from authorized Korean distributors. If you receive an
            item you believe is not authentic, contact us within 14 days for a full refund.
          </p>
        </section>
      </article>
    </div>
  );
}
