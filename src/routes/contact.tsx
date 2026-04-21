import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — GLOW" },
      { name: "description", content: "Get in touch with the GLOW team." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(2000),
});

function ContactPage() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("support_tickets").insert({
      ...parsed.data,
      user_id: user?.id ?? null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not send message");
      return;
    }
    setSent(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <p className="text-xs tracking-[0.3em] text-gold mb-3">GET IN TOUCH</p>
        <h1 className="font-display text-5xl">We'd love to hear from you</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          {[
            { icon: Mail, t: "Email", v: "hello@glow-beauty.kr" },
            { icon: Phone, t: "Phone", v: "+82 2 555 0199" },
            { icon: MapPin, t: "Atelier", v: "Gangnam, Seoul, South Korea" },
          ].map((i) => (
            <div key={i.t} className="luxe-card rounded-xl p-5 flex gap-3">
              <i.icon size={20} style={{ color: "var(--gold)" }} className="shrink-0 mt-1" />
              <div>
                <p className="text-xs tracking-wider text-muted-foreground uppercase">{i.t}</p>
                <p className="font-medium mt-1">{i.v}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 luxe-card rounded-xl p-8">
          {sent ? (
            <div className="text-center py-12">
              <CheckCircle2 className="mx-auto mb-4" size={48} style={{ color: "var(--gold)" }} />
              <h3 className="font-display text-2xl mb-2">Message received</h3>
              <p className="text-muted-foreground text-sm">Our team will reply within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    required
                    defaultValue={user?.user_metadata?.display_name || ""}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" name="email" required defaultValue={user?.email || ""} />
                </div>
              </div>
              <div>
                <Label>Subject</Label>
                <Input name="subject" required />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea name="message" rows={6} required />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-gold text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
