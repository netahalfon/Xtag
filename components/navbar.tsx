"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import LogoutModal from "./logout-modal";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItemsWorker = [
  { name: "My Salary", href: "/worker/my-salary" },
  { name: "Settings", href: "/worker/settings" },
];

const navItemsManager = [
  ...navItemsWorker,
  { name: "Add Shifts", href: "/manager/add-shifts" },
];

const navItemsAdmin = [
  ...navItemsManager,
  { name: "All Shifts", href: "/admin/all-shifts" },
  { name: "All Workers", href: "/admin/all-workers" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoutButton = () => {
    setShowLogoutModal(true);
    setMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    try {
      //logout logic
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/auth/login");
      setShowLogoutModal(false);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data) {
          setRole(data.role);
        }
      }
      setLoading(false);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

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

          {/* Desktop Navigation */}
          {user && role === "worker" && (
            <nav className="hidden md:flex items-center gap-8">
              {navItemsWorker.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-base font-normal transition-colors pb-1",
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogoutButton}
                className="ml-4 px-6 py-2 text-base font-normal text-orange-600 border-2 border-orange-600 hover:bg-orange-50 transition-colors"
              >
                Log out
              </button>
            </nav>
          )}

          {user && role === "manager" && (
            <nav className="hidden md:flex items-center gap-8">
              {navItemsManager.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-base font-normal transition-colors pb-1",
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogoutButton}
                className="ml-4 px-6 py-2 text-base font-normal text-orange-600 border-2 border-orange-600 hover:bg-orange-50 transition-colors"
              >
                Log out
              </button>
            </nav>
          )}

          {user && role === "admin" && (
            <nav className="hidden md:flex items-center gap-8">
              {navItemsAdmin.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-base font-normal transition-colors pb-1",
                    pathname === item.href
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogoutButton}
                className="ml-4 px-6 py-2 text-base font-normal text-orange-600 border-2 border-orange-600 hover:bg-orange-50 transition-colors"
              >
                Log out
              </button>
            </nav>
          )}

          {user && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
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

        {user && menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 mt-2">
            <nav className="flex flex-col gap-1 pt-4">
              {role === "worker" &&
                navItemsWorker.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
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
              {role === "manager" &&
                navItemsManager.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
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
              {role === "admin" &&
                navItemsAdmin.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
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
                Log out
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
