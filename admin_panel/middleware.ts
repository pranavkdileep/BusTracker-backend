import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_jwt_secret_key_change_in_production")

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes that don't require authentication
  if (pathname === "/" || pathname.startsWith("/_next") || pathname.startsWith("/api/auth")) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value

  // If no token and trying to access protected route
  if (!token && pathname.startsWith("/dashboard")) {
    const url = new URL("/", request.url)
    return NextResponse.redirect(url)
  }

  // Verify token if it exists
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET)

      // If token is valid and user is trying to access login page
      if (pathname === "/") {
        const url = new URL("/dashboard", request.url)
        return NextResponse.redirect(url)
      }

      // Continue to protected route
      return NextResponse.next()
    } catch (error) {
      // Token is invalid, redirect to login
      if (pathname.startsWith("/dashboard")) {
        const url = new URL("/", request.url)
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

