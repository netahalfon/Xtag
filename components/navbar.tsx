"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import LogoutModal from "./logout-modal";
import { Menu, X } from "lucide-react"


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
    <header className="navbar navbar-expand-lg bg-white border-bottom py-4">
      <div className="container flex h-16 items-center justify-between">
        {/* לוגו ושם */}
        <Link className="navbar-brand" href="/worker/my-salary">
          <img
            src="/xtag-icon.svg"
            alt="Logo"
            height="35"
            width="80"
            className="d-inline-block align-text-top"
          />
        </Link>

        {/* תפריט למסכים גדולים */}
        {user && role === "worker" && (
          <nav className="hidden lg:flex items-center gap-6">
            <>
              {navItemsWorker.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "btn nav_item ",
                    pathname === item.href ? "bg-amber-500" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <button onClick={handleLogoutButton} className="logout_button">
                Log out
              </button>
            </>
          </nav>
        )}

        {user && role === "manager" && (
          <nav className="hidden lg:flex items-center gap-6">
            <>
              {navItemsManager.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "btn nav_item ",
                    pathname === item.href ? "bg-amber-500" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <button onClick={handleLogoutButton} className="logout_button">
                Log out
              </button>
            </>
          </nav>
        )}

        {user && role === "admin" && (
          <nav className="hidden lg:flex items-center gap-6">
            <>
              {navItemsAdmin.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "btn nav_item ",
                    pathname === item.href ? "bg-amber-500" : ""
                  )}
                >
                  {item.name}
                </Link>
              ))}

              <button onClick={handleLogoutButton} className="logout_button">
                Log out
              </button>
            </>
          </nav>
        )}

        {showLogoutModal && (
          <LogoutModal
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
          />
        )}
      </div>
    </header>
  );
}
