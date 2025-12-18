"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase.from("users").select("role").eq("id", user.id).single()

        if (data) {
          setRole(data.role)
        }
      }
      setLoading(false)
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchUser()
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          <img src="/images/image.png" alt="Logo" height="30" className="d-inline-block align-text-top" />
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {user && role === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${pathname === "/admin/all-shifts" ? "active" : ""}`}
                    href="/admin/all-shifts"
                  >
                    All Shifts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${pathname === "/admin/all-workers" ? "active" : ""}`}
                    href="/admin/all-workers"
                  >
                    All Workers
                  </Link>
                </li>
              </>
            )}
            {user && role === "manager" && (
              <li className="nav-item">
                <Link
                  className={`nav-link ${pathname === "/manager/add-shifts" ? "active" : ""}`}
                  href="/manager/add-shifts"
                >
                  Add Shifts
                </Link>
              </li>
            )}
            {user && role === "worker" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${pathname === "/worker/my-salary" ? "active" : ""}`}
                    href="/worker/my-salary"
                  >
                    My Salary
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${pathname === "/worker/settings" ? "active" : ""}`}
                    href="/worker/settings"
                  >
                    Settings
                  </Link>
                </li>
              </>
            )}
          </ul>
          <div className="d-flex">
            {loading ? (
              <span className="navbar-text text-light">Loading...</span>
            ) : user ? (
              <>
                <span className="navbar-text text-light me-3">
                  {user.email} ({role})
                </span>
                <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
