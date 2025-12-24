"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Menu, X } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import LogoutModal from "./logout-modal";

const navItemsWorker = [
  { name: "המשכורת שלי", href: "/worker/my-salary" },
  { name: "פרופיל", href: "/worker/settings" },
];

const navItemsManager = [
  ...navItemsWorker,
  { name: "הוספת משמרת", href: "/manager/add-shifts" },
];

const navItemsAdmin = [
  ...navItemsManager,
  { name: "כל המשמרות", href: "/admin/all-shifts" },
  { name: "כל העובדים", href: "/admin/all-workers" },
];

type Role = "worker" | "manager" | "admin" | null;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role>(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (!user || !role) return [];
    if (role === "admin") return navItemsAdmin;
    if (role === "manager") return navItemsManager;
    return navItemsWorker;
  }, [user, role]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogoutButton = () => {
    setShowLogoutModal(true);
    closeMenu();
  };

  const handleConfirmLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setShowLogoutModal(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCancelLogout = () => setShowLogoutModal(false);

  useEffect(() => {
    const supabase = createClient();

    const fetchUserAndRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (!user) {
        setRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Failed to fetch role:", error);
        setRole(null);
        return;
      }

      setRole((data?.role as Role) ?? null);
    };

    fetchUserAndRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUserAndRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/worker/my-salary" className="flex-shrink-0">
            <img
              src="/xtag-icon.svg"
              alt="Xtag Logo"
              height="35"
              width="80"
              className="h-8"
            />
          </Link>

          {/* Desktop Navigation (single render) */}
          {user && (
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium no-underline transition-colors",
                    pathname === item.href
                      ? "bg-orange-50 text-slate-900"
                      : "text-slate-900 hover:bg-orange-50"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={handleLogoutButton}
                className="ml-4 rounded-full px-6 py-2 text-base font-medium text-orange-600 border-2 border-orange-600 hover:bg-orange-600
    hover:text-white transition-colors"
              >
                התנתקות
              </button>
            </nav>
          )}

          {/* Mobile toggle */}
          {user && (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          )}
        </div>

        {/* Mobile menu (single render) */}
        {user && menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <nav className="flex flex-col gap-1 pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "px-4 py-3 text-base font-normal transition-colors",
                    pathname === item.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <button
                onClick={handleLogoutButton}
                className="mt-2 mx-4 px-6 py-2 text-base font-normal text-orange-600 border-2 border-orange-600 hover:bg-orange-50 transition-colors text-center"
              >
                התנתקות
              </button>
            </nav>
          </div>
        )}
      </div>

      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </header>
  );
}
