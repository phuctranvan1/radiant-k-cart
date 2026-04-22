import { Link } from "@tanstack/react-router";
import { ShoppingBag, Search, User as UserIcon, Menu, X, Sparkles, Heart } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/useCart";
import { useWishlist } from "@/lib/useWishlist";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/products", label: "All Products" },
  { to: "/categories/skincare", label: "Skincare" },
  { to: "/categories/makeup", label: "Makeup" },
  { to: "/categories/suncare", label: "Suncare" },
  { to: "/categories/sets-gifts", label: "Sets" },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { count } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const [open, setOpen] = useState(false);
  const { hidden, scrolled } = useHideOnScroll(120);

  return (
    <header
      className={cn(
        "header-shell sticky top-0 z-40 glass border-b border-border/40",
        hidden && !open && "is-hidden",
        scrolled && "is-scrolled",
      )}
    >
      {/* Promo bar */}
      <div className="bg-gradient-gold text-primary-foreground text-center text-[11px] py-2 font-medium tracking-[0.2em] overflow-hidden">
        <div className="marquee">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12 whitespace-nowrap px-6">
                <span>✨ FREE SHIPPING WORLDWIDE OVER $80</span>
                <span>·</span>
                <span>USE CODE WELCOME10 FOR 10% OFF</span>
                <span>·</span>
                <span>NEW DROPS EVERY FRIDAY</span>
                <span>·</span>
                <span>AUTHENTIC FROM SEOUL</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 flex items-center justify-between h-16 gap-4">
        <button onClick={() => setOpen(!open)} className="lg:hidden p-2" aria-label="Menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="flex items-center gap-2 group">
          <Sparkles
            className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500"
            style={{ color: "var(--gold)" }}
          />
          <span className="font-display text-2xl font-semibold tracking-wide text-gold-shine">
            GLOW
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/search" className="p-2 hover:text-gold transition-colors" aria-label="Search">
            <Search size={20} />
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/account"
                className="p-2 hover:text-gold transition-colors"
                aria-label="Account"
              >
                <UserIcon size={20} />
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-xs px-2 py-1 border border-gold rounded text-gold hover:bg-gold/10 transition"
                >
                  Admin
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut} className="text-xs">
                Sign out
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="hidden md:block">
              <Button variant="ghost" size="sm" className="text-xs gap-2">
                <UserIcon size={16} />
                Sign in
              </Button>
            </Link>
          )}
          {/* Wishlist icon */}
          <Link
            to="/wishlist"
            className="p-2 hover:text-gold transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-gold text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </Link>
          <Link
            to="/cart"
            className="p-2 hover:text-gold transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-gold text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="py-2 text-sm" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link to="/wishlist" className="py-2 text-sm" onClick={() => setOpen(false)}>
              Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
            </Link>
            <Link to="/auth" className="py-2 text-sm" onClick={() => setOpen(false)}>
              Account
            </Link>
            <Link to="/order-lookup" className="py-2 text-sm" onClick={() => setOpen(false)}>
              Track Order
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
