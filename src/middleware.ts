export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/drawn/:path*",
    "/movies/:path*",
    "/watched",
    "/activity",
    "/profile/:path*",
    "/lists/:path*",
    "/users/:path*",
    "/reviews/:path*",
  ],
};
