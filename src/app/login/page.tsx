import { LoginForm } from "@/components/auth/LoginForm"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Leaf } from "lucide-react"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Leaf className="h-12 w-12 text-emerald-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            Tea Valuation System
          </h1>
          <p className="mt-2 text-sm text-gray-600">Colombo Tea Auction — Broker&apos;s Platform</p>
        </div>
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
