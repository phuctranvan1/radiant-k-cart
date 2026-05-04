import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

/**
 * Subtle install / "add to home screen" prompt. Captures BeforeInstallPrompt
 * on supported browsers and shows a small dismissible card after a delay.
 */
type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const KEY = "glow_install_dismissed";

export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    const onBIP = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setTimeout(() => setShow(true), 8000);
    };
    window.addEventListener("beforeinstallprompt", onBIP as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", onBIP as EventListener);
  }, []);

  if (!show || !evt) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  const install = async () => {
    await evt.prompt();
    const choice = await evt.userChoice;
    if (choice.outcome === "accepted") dismiss();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-xs animate-in slide-in-from-bottom-4 fade-in luxe-card border border-gold/30 rounded-xl p-4 shadow-gold-lg">
      <button
        onClick={dismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      <p className="text-xs tracking-[0.25em] text-gold mb-1">INSTALL APP</p>
      <p className="font-display text-lg leading-tight mb-3">
        Add GLOW to your home screen
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        Faster checkout, exclusive drops, member-only perks.
      </p>
      <Button onClick={install} size="sm" className="w-full bg-gradient-gold text-primary-foreground">
        <Download size={14} className="mr-2" /> Install
      </Button>
    </div>
  );
}
