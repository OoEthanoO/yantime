export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "yantime",
      commit: process.env.YANTIME_COMMIT_SHA ?? "development",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
