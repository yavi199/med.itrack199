
"use client"

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";

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


export function AppHeader() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-3">
            <AppLogo className="h-12 w-12 text-primary" />
            <div className="grid">
              <h1 className="text-2xl font-bold font-headline text-gray-800 dark:text-gray-200">
                Med-iTrack
              </h1>
              <p className="text-xs text-muted-foreground font-medium tracking-wide">
                Precision you can trace.
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${user.uid}`} alt={userProfile?.nombre} />
                      <AvatarFallback>{getInitials(userProfile?.nombre || '')}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile?.nombre}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize pt-1 font-semibold">{userProfile?.rol} / {userProfile?.servicioAsignado}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userProfile?.rol === 'administrador' && (
                    <Link href="/signup">
                      <DropdownMenuItem>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>Crear Usuario</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
