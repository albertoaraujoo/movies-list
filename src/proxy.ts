export { auth as proxy } from "@/auth";

export const config = {
  // Protege apenas as rotas privadas: /dashboard e /drawn
  matcher: ["/dashboard/:path*", "/drawn/:path*"],
};
