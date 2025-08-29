import { AppHeader } from "@/components/app/app-header";
import { NewRequestCard } from "@/components/app/new-request-card";
import { StudyTable } from "@/components/app/study-table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <NewRequestCard />

          <Card className="shadow-lg border-border xl:col-span-2 flex flex-col">
            <CardHeader className="p-4">
              <CardTitle className="font-headline font-semibold text-lg text-foreground">
                Resumen de Estudios Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">12</p>
                <p className="text-sm text-muted-foreground">ECO</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">8</p>
                <p className="text-sm text-muted-foreground">RX</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">5</p>
                <p className="text-sm text-muted-foreground">TAC</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">3</p>
                <p className="text-sm text-muted-foreground">RMN</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-100 p-3 rounded-lg text-center border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
                <p className="text-xl font-bold font-headline text-red-800 dark:text-red-300">7</p>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">Urgencias</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg text-center border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50">
                <p className="text-xl font-bold font-headline text-blue-800 dark:text-blue-300">15</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Hospitalización</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg text-center border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50">
                <p className="text-xl font-bold font-headline text-purple-800 dark:text-purple-300">6</p>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">UCI</p>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <StudyTable />
        </div>
      </main>
    </div>
  );
}
