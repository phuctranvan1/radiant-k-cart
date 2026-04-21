import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — GLOW" }] }),
  component: AuthPage,
});

const emailSchema = z.string().trim().email().max(255);
const passSchema = z.string().min(6).max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState<string | null>(null);

  useEffect(() => { if (user) navigate({ to: "/account" }); }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passSchema.safeParse(fd.get("password"));
    const display_name = String(fd.get("display_name") ?? "").trim().slice(0, 80);
    if (!email.success) return toast.error("Invalid email");
    if (!password.success) return toast.error("Password must be 6+ chars");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.data, password: password.data,
      options: { emailRedirectTo: `${window.location.origin}/`, data: { display_name } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome to GLOW ✨");
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passSchema.safeParse(fd.get("password"));
    if (!email.success || !password.success) return toast.error("Check your credentials");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.data, password: password.data });
    setLoading(false);
    if (error) return toast.error(error.message);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/` });
    setLoading(false);
    if (error) toast.error("Google sign-in failed");
  };

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    if (!email.success) return toast.error("Invalid email");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.data,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setOtpSent(email.data);
    toast.success("Check your email for the 6-digit code");
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!otpSent) return;
    const fd = new FormData(e.currentTarget);
    const token = String(fd.get("token") ?? "").trim();
    if (token.length !== 6) return toast.error("Enter the 6-digit code");
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email: otpSent, token, type: "email" });
    setLoading(false);
    if (error) return toast.error(error.message);
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="text-center mb-8">
        <Sparkles className="mx-auto mb-3" size={28} style={{ color: "var(--gold)" }} />
        <h1 className="font-display text-4xl">Welcome to GLOW</h1>
        <p className="text-muted-foreground text-sm mt-2">Sign in to track orders, save favorites, and unlock perks.</p>
      </div>

      <div className="luxe-card rounded-xl p-6">
        <Button onClick={handleGoogle} variant="outline" className="w-full mb-4 border-gold" disabled={loading}>
          Continue with Google
        </Button>
        <div className="flex items-center gap-2 my-4 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
            <TabsTrigger value="otp">OTP</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-3 mt-4">
              <div><Label>Email</Label><Input type="email" name="email" required /></div>
              <div><Label>Password</Label><Input type="password" name="password" required /></div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground" disabled={loading}>Sign in</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-3 mt-4">
              <div><Label>Display name</Label><Input name="display_name" /></div>
              <div><Label>Email</Label><Input type="email" name="email" required /></div>
              <div><Label>Password (6+ chars)</Label><Input type="password" name="password" required minLength={6} /></div>
              <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground" disabled={loading}>Create account</Button>
            </form>
          </TabsContent>

          <TabsContent value="otp">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">We'll email you a 6-digit code to sign in without a password.</p>
                <div><Label>Email</Label><Input type="email" name="email" required /></div>
                <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground" disabled={loading}>Send code</Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">Code sent to <span className="text-gold">{otpSent}</span></p>
                <div><Label>6-digit code</Label><Input name="token" maxLength={6} required inputMode="numeric" /></div>
                <Button type="submit" className="w-full bg-gradient-gold text-primary-foreground" disabled={loading}>Verify & sign in</Button>
                <button type="button" onClick={() => setOtpSent(null)} className="text-xs text-muted-foreground hover:text-gold w-full">← Use different email</button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
