import { clerkMiddleware , clerkClient} from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  "/",
  "/api/webhook/register",
  "/sign-up",
  "/sign-in",
]
export default clerkMiddleware(async (auth, req) => {
  //handle unauth users trying to access private routes
  try {
    const authData = await auth()
    if (!authData.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
    if(authData.userId){
      const client = await clerkClient()
      const user = await client.users.getUser(authData.userId)
      const role =user.publicMetadata.role as string | undefined
  
      // admin role redirection
      if(role === 'admin' && req.nextUrl.pathname !== '/dashboard') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      //Prevent non admin users to access the admin routes
      if(role!== 'admin' && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      //Redirect auth users trying to access public routes
      if(publicRoutes.includes(req.nextUrl.pathname))  {
        return NextResponse.redirect(
          new URL(
            role === "admin" ? "/admin/dashboard" : "/dashboard",
            req.url
          )
        )
      }
    }
  } catch (error) {
    console.error(error)
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}