import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Spinner } from "@/components/ui/spinner";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex w-full max-w-md justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
