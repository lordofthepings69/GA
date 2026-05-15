import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { hasPermission, Permission } from "@/lib/rbac"
import { Session } from "next-auth"

type Handler = (
  req: Request,
  context: { params: Record<string, string> },
  session: Session
) => Promise<Response>

export function withAuth(handler: Handler, requiredPermission?: Permission) {
  return async (req: Request, context: { params: Record<string, string> }) => {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (
      requiredPermission &&
      !hasPermission(session.user.role, requiredPermission)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    try {
      return await handler(req, context, session)
    } catch (e) {
      console.error(e)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
