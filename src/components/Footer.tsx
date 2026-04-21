import { Link } from "@tanstack/react-router";
import { Sparkles, Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24 bg-card/40">
      <div className="container mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5" style={{ color: "var(--gold)" }} />
            <span className="font-display text-2xl font-semibold text-gold">GLOW</span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Luxury Korean beauty, curated for the modern devotee of glass skin.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Twitter size={18} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-gold">
              <Facebook size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-foreground">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/categories/skincare" className="hover:text-foreground">
                Skincare
              </Link>
            </li>
            <li>
              <Link to="/categories/makeup" className="hover:text-foreground">
                Makeup
              </Link>
            </li>
            <li>
              <Link to="/categories/sets-gifts" className="hover:text-foreground">
                Sets & Gifts
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Help</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/support" className="hover:text-foreground">
                Support Center
              </Link>
            </li>
            <li>
              <Link to="/order-lookup" className="hover:text-foreground">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                Shipping & Returns
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Brand</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-foreground">
                About GLOW
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/policy" className="hover:text-foreground">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="gold-divider" />
      <div className="container mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GLOW Beauty Boutique. Crafted with devotion in Seoul.
      </div>
    </footer>
  );
}
