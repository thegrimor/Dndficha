import Link from "next/link";

import { restablecerContrasena } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Nueva contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          {!token ? (
            <p className="text-sm text-muted-foreground">
              Este enlace no es válido. Pídele a quien administra la app uno nuevo.
            </p>
          ) : (
            <form action={restablecerContrasena} className="flex flex-col gap-4">
              <input type="hidden" name="token" value={token} />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña nueva
                </label>
                <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmacion" className="text-sm font-medium">
                  Repite la contraseña
                </label>
                <Input id="confirmacion" name="confirmacion" type="password" required minLength={8} autoComplete="new-password" />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit">Cambiar contraseña</Button>
            </form>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/login" className="text-primary underline">
              Volver a iniciar sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
