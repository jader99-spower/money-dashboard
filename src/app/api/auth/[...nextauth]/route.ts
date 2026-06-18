import { handlers } from "@/auth";

async function wrappedGET(req: Request) {
  try {
    return await handlers.GET(req as never);
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e);
    console.error("[auth] GET error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

async function wrappedPOST(req: Request) {
  try {
    return await handlers.POST(req as never);
  } catch (e: unknown) {
    const msg = e instanceof Error ? `${e.name}: ${e.message}\n${e.stack}` : String(e);
    console.error("[auth] POST error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export { wrappedGET as GET, wrappedPOST as POST };
