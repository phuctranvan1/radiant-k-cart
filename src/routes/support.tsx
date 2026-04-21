import { createFileRoute, Link } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Truck, RefreshCw, Shield } from "lucide-react";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support Center — GLOW" }] }),
  component: SupportPage,
});

const faqs = [
  { q: "How long does shipping take?", a: "Standard shipping takes 5–10 business days worldwide. Express shipping (3–5 days) is available at checkout." },
  { q: "Is my order authentic?", a: "Yes — we source every product directly from authorized Korean distributors. Authenticity is guaranteed or your money back." },
  { q: "What is your return policy?", a: "Unopened items can be returned within 30 days for a full refund. Opened skincare cannot be returned for hygiene reasons." },
  { q: "Do you ship internationally?", a: "We ship to over 80 countries. Free worldwide shipping on orders over $80." },
  { q: "How do I apply a promo code?", a: "Enter your code in the promo code field at checkout and click Apply. Discounts will appear in your order summary." },
  { q: "Are your products cruelty-free?", a: "All GLOW products are 100% cruelty-free. We never test on animals and only partner with brands that share our values." },
  { q: "Can I modify or cancel my order?", a: "Orders can be modified or cancelled within 1 hour of placement. Contact our support team immediately." },
];

function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">SUPPORT CENTER</p>
        <h1 className="font-display text-5xl">How can we help?</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-12">
        {[
          { icon: Truck, t: "Shipping", to: "#shipping" },
          { icon: RefreshCw, t: "Returns", to: "#returns" },
          { icon: Shield, t: "Authenticity", to: "#auth" },
          { icon: MessageCircle, t: "Contact us", to: "/contact" },
        ].map((i) => (
          <Link key={i.t} to={i.to} className="luxe-card rounded-xl p-6 text-center group">
            <i.icon className="mx-auto mb-2 group-hover:scale-110 transition-transform" size={24} style={{ color: "var(--gold)" }} />
            <p className="font-display text-lg">{i.t}</p>
          </Link>
        ))}
      </div>

      <div className="luxe-card rounded-xl p-8">
        <h2 className="font-display text-3xl mb-6 text-center">Frequently asked</h2>
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left hover:text-gold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center mt-12">
        <p className="text-muted-foreground mb-4">Still have questions?</p>
        <Link to="/contact" className="text-gold underline">Contact our team →</Link>
      </div>
    </div>
  );
}
