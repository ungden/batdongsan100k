"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./NotificationBell";

const menuItems = [
  { label: "Mua bán", href: "/listings" },
  { label: "Cho thuê", href: "/listings?category=rent" },
  { label: "Dự án", href: "/market-overview" },
  { label: "Công cụ", href: "/calculator" },
  { label: "Tin tức", href: "/news" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserDropdownOpen(false);
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/listings?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-3 w-full gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="TitanHome" width={32} height={32} className="w-8 h-8" />
          <span className="text-xl font-black tracking-tighter">
            <span className="text-[#001e40]">Titan</span>
            <span className="text-[#006c47]">Home</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                isActive(item.href)
                  ? "text-sm font-bold text-primary border-b-2 border-secondary py-1"
                  : "text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-xs mx-4">
          <form onSubmit={handleSearch} className="relative w-full flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              placeholder="Tìm kiếm khu vực, dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="hidden md:flex items-center gap-2 text-on-surface-variant font-medium text-sm hover:text-primary transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.user_metadata?.full_name || user.email}</span>
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl border border-outline-variant/20 py-2 z-50">
                  <Link href="/dashboard" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low">Quản lý tin đăng</Link>
                  <Link href="/saved" onClick={() => setUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low">Tin đã lưu</Link>
                  <hr className="my-2 border-outline-variant/20" />
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5">Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden md:block text-on-surface-variant font-medium text-sm hover:text-primary transition-colors">
              Đăng nhập/Đăng ký
            </Link>
          )}

          <Link
            href="/post"
            className="bg-primary-gradient text-on-primary px-6 py-2.5 rounded-md text-sm font-semibold active:opacity-80 transition-transform shadow-lg"
          >
            Đăng tin
          </Link>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden text-on-surface p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-outline-variant/20 h-[1px] w-full"></div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface/95 backdrop-blur-xl border-t border-outline-variant/20">
          <div className="px-8 py-4 space-y-1">
            <form onSubmit={handleSearch} className="relative w-full flex items-center mb-6">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                placeholder="Tìm kiếm khu vực, dự án..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/30 text-on-surface text-sm rounded-full pl-10 pr-4 py-3 focus:outline-none"
              />
            </form>

            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  isActive(item.href)
                    ? "block py-3 text-sm font-medium text-primary border-l-2 border-secondary pl-4"
                    : "block py-3 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors pl-4"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <hr className="my-2 border-outline-variant/20" />
            
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-on-surface-variant pl-4">Quản lý tin đăng</Link>
                <Link href="/saved" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-on-surface-variant pl-4">Tin đã lưu</Link>
                <button onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="w-full text-left block py-3 text-sm font-medium text-error pl-4">Đăng xuất</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-sm font-medium text-primary pl-4">Đăng nhập / Đăng ký</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
