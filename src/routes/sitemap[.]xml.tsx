import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://radiant-k-cart.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL!,
          process.env.VITE_SUPABASE_PUBLISHABLE_KEY!,
        );
        const [{ data: products }, { data: categories }] = await Promise.all([
          supabase.from("products").select("slug,updated_at"),
          supabase.from("categories").select("slug"),
        ]);

        const staticPaths = [
          "",
          "/products",
          "/about",
          "/contact",
          "/lookbook",
          "/bundles",
          "/skin-quiz",
          "/skin-scan",
          "/rewards",
          "/subscriptions",
          "/policy",
          "/support",
        ];

        const urls: string[] = [];
        const today = new Date().toISOString().split("T")[0];

        for (const p of staticPaths) {
          urls.push(
            `<url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${p === "" ? "1.0" : "0.8"}</priority></url>`,
          );
        }
        for (const c of categories ?? []) {
          urls.push(
            `<url><loc>${SITE_URL}/categories/${c.slug}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          );
        }
        for (const pr of products ?? []) {
          const lastmod = pr.updated_at
            ? new Date(pr.updated_at).toISOString().split("T")[0]
            : today;
          urls.push(
            `<url><loc>${SITE_URL}/products/${pr.slug}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`,
          );
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
