
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { UserRole, Service, SubServiceArea } from '@/lib/types';

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

const roles: UserRole[] = ["administrador", "enfermero", "tecnologo", "transcriptora"];
const services: Service[] = ["TAC", "RX", "ECO", "MAMO", "DENSITOMETRIA", "RMN", "General"];
const subServiceAreas: SubServiceArea[] = ["TRIAGE", "OBS1", "OBS2", "HOSP 2", "HOSP 4", "UCI 2", "UCI 3", "UCI NEO", "C.EXT"];


export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<UserRole>('enfermero');
  const [servicioAsignado, setServicioAsignado] = useState<Service | SubServiceArea>('TRIAGE');
  
  const { signup, userProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // In a real app, you would uncomment this to protect the route
  // useEffect(() => {
  //   if (userProfile && userProfile.rol !== 'administrador') {
  //     router.push('/');
  //   }
  // }, [userProfile, router]);

  const handleRoleChange = (value: UserRole) => {
    setRol(value);
    // Reset service when role changes to avoid invalid combinations
    if (value === 'administrador') {
      setServicioAsignado('General');
    } else if (value === 'enfermero') {
      setServicioAsignado('TRIAGE');
    } else { // tecnologo or transcriptora
      setServicioAsignado('TAC');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        toast({
            variant: "destructive",
            title: "Contraseña Débil",
            description: "La contraseña debe tener al menos 6 caracteres.",
        });
        return;
    }

    setLoading(true);
    try {
      await signup(email, password, {
        nombre,
        rol,
        servicioAsignado,
        activo: true
      });
      toast({
        title: 'Usuario Creado',
        description: 'El nuevo usuario ha sido registrado exitosamente.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error de Registro',
        description: error.message || 'No se pudo crear el usuario. Intenta de nuevo.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceOptions = () => {
    if (rol === 'enfermero') {
      return subServiceAreas;
    }
    if (rol === 'tecnologo' || rol === 'transcriptora') {
      return services.filter(s => s !== 'General');
    }
    return [];
  };

  const serviceOptions = getServiceOptions();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-4">
                <AppLogo className="h-14 w-14 text-primary" />
            </div>
          <CardTitle className="text-2xl">Crear Nuevo Usuario</CardTitle>
          <CardDescription>Registra un nuevo miembro del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                type="text"
                placeholder="John Doe"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select onValueChange={(value: UserRole) => handleRoleChange(value)} defaultValue={rol}>
                        <SelectTrigger id="rol">
                            <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                            {roles.map(r => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                {rol !== 'administrador' && (
                    <div className="space-y-2">
                        <Label htmlFor="servicio">{rol === 'enfermero' ? 'Área de Servicio' : 'Servicio'}</Label>
                        <Select onValueChange={(value: Service | SubServiceArea) => setServicioAsignado(value)} value={servicioAsignado}>
                            <SelectTrigger id="servicio">
                                <SelectValue placeholder="Selecciona una opción" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Usuario
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                Ya tienes una cuenta? <Link href="/login" className="font-semibold text-primary hover:underline">Inicia sesión</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

