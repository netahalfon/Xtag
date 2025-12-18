import Link from "next/link"

export default function Home() {
  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 text-center">
          <h1 className="display-4 mb-4">Welcome to Workforce Management</h1>
          <p className="lead mb-4">Manage your team with role-based access control</p>
          <div className="d-flex gap-3 justify-content-center">
            <Link href="/auth/login" className="btn btn-primary btn-lg">
              Login
            </Link>
            <Link href="/auth/signup" className="btn btn-outline-primary btn-lg">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
