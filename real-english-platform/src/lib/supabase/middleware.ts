import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create an unmodified Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Validate session - handle auth errors gracefully
    let user = null;
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.error('[Middleware] Auth error:', error.message);
            // Clear invalid session and redirect to login for protected routes
            if (request.nextUrl.pathname.startsWith('/dashboard') ||
                request.nextUrl.pathname.startsWith('/admin')) {
                const redirectUrl = new URL('/auth/login', request.url);
                const redirectResponse = NextResponse.redirect(redirectUrl);
                // Clear auth cookies
                redirectResponse.cookies.delete('sb-uzpjzwawhgflpxogkswe-auth-token');
                return redirectResponse;
            }
        }
        user = data?.user;
    } catch (authError) {
        console.error('[Middleware] Auth exception:', authError);
        // On auth exception, redirect to login for protected routes
        if (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    // Protect /dashboard routes (Student + Teacher)
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Protect /admin routes (Teacher only)
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }

        // Check role from metadata (assuming it is synced)
        const role = user.user_metadata?.role;
        if (role !== 'teacher') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return response
}
