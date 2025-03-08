import { LoginForm } from "@/components/auth/login-form"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}

