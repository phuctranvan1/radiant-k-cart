import { Outlet, createRootRoute, HeadContent, Scripts, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/useTheme";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { Toaster } from "@/components/ui/sonner";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for has drifted away.
        </p>
        <Link
          to="/"
          className="inline-flex mt-6 items-center justify-center rounded-md bg-gradient-gold px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GLOW — Luxury Korean Beauty Boutique" },
      {
        name: "description",
        content:
          "Discover premium K-beauty essentials. Skincare, makeup, suncare and curated sets — handpicked from Seoul.",
      },
      { name: "author", content: "GLOW" },
      { property: "og:title", content: "GLOW — Luxury Korean Beauty Boutique" },
      {
        property: "og:description",
        content:
          "Discover premium K-beauty essentials. Skincare, makeup, suncare and curated sets — handpicked from Seoul.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GLOW — Luxury Korean Beauty Boutique" },
      {
        name: "twitter:description",
        content:
          "Discover premium K-beauty essentials. Skincare, makeup, suncare and curated sets — handpicked from Seoul.",
      },
      {
        property: "og:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/676a5192-f4a3-4443-8ebd-fccda4d0809f/id-preview-b08c63a9--2ba081aa-e13d-4947-8d38-f7b98bd9b882.lovable.app-1776759822895.png",
      },
      {
        name: "twitter:image",
        content:
          "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/676a5192-f4a3-4443-8ebd-fccda4d0809f/id-preview-b08c63a9--2ba081aa-e13d-4947-8d38-f7b98bd9b882.lovable.app-1776759822895.png",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  useScrollReveal();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Smooth scroll-to-top on route change + re-init reveal observers for new content
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    // Re-trigger reveal observation for newly mounted nodes on next frame
    const id = window.requestAnimationFrame(() => {
      document.querySelectorAll(".reveal-on-scroll:not(.is-visible)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight - 60) el.classList.add("is-visible");
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <ChatWidget />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
