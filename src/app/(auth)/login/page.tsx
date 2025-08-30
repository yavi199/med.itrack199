
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const AppLogo = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <path fill="none" d="M0 0h256v256H0z" />
    <path
      fill="currentColor"
      d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24zm44.24 88.54-52.5 52.5a8 8 0 0 1-11.32 0l-28.5-28.5a8 8 0 0 1 11.32-11.32L112 147.31l46.92-46.91a8 8 0 0 1 11.32 11.32z"
      opacity="0.2"
    />
    <path
      d="M232 128A104 104 0 1 1 128 24a104.11 104.11 0 0 1 104 104zm-59.76-15.46a8 8 0 0 0-11.32-11.32L112 147.31l-22.92-22.91a8 8 0 0 0-11.32 11.32l28.5 28.5a8 8 0 0 0 11.32 0l52.5-52.5z"
      fill="currentColor"
    />
  </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Bienvenido de nuevo.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Inicio de Sesión',
        description: error.message || 'Ocurrió un error. Por favor, intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <AppLogo className="h-14 w-14 text-primary" />
                <div className='grid text-left'>
                    <h1 className="text-3xl font-bold font-headline text-gray-800 dark:text-gray-200">Med-iTrack</h1>
                    <p className="text-sm text-muted-foreground font-medium tracking-wide">Precision you can trace.</p>
                </div>
            </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                No tienes una cuenta? <Link href="/signup" className="font-semibold text-primary hover:underline">Regístrate</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
