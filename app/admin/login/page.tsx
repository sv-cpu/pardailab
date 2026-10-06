import { Mark } from "@/components/site-header";
import { LoginForm } from "@/components/admin/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 flex items-center gap-2 text-olive">
        <Mark className="size-8" />
        <span className="font-heading text-xl text-foreground">
          PardAi<span className="text-olive">Lab</span>
        </span>
      </div>
      <h1 className="font-heading text-4xl tracking-tight">Вход в редакцию</h1>
      <p className="mt-3 text-sm text-muted-foreground">Материалы, сервисы и модели лаборатории.</p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
