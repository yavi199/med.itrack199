"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from "@/lib/utils";

const exampleRequests = [
  { id: '1', status: 'Completado', service: 'URG', patient: { name: 'GARCIA MARQUEZ, GABRIEL', id: '12345678', entidad: 'MUTUALSER' }, study: { name: 'TAC DE CRANEO SIMPLE', cups: '879101', modality: 'TAC' }, requestDate: '28 Ago, 14:30', completionDate: '28 Ago, 15:00' },
  { id: '2', status: 'Pendiente', service: 'HOSP', patient: { name: 'BOTERO, FERNANDO', id: '87654321', entidad: 'CAJACOPI' }, study: { name: 'RX DE TORAX', cups: '874101', modality: 'RX' }, requestDate: '28 Ago, 13:00', completionDate: 'N/A' },
  { id: '3', status: 'Leído', service: 'HOSP', patient: { name: 'ROJAS, CARLOS', id: '11223344', entidad: 'MUTUALSER' }, study: { name: 'ECOGRAFIA ABDOMINAL', cups: '881301', modality: 'ECO' }, requestDate: '27 Ago, 10:00', completionDate: '27 Ago, 10:45' },
  { id: '4', status: 'Cancelado', service: 'UCI', patient: { name: 'MENDOZA, SOFIA', id: '55667788', entidad: 'NUEVA EPS' }, study: { name: 'RMN DE RODILLA', cups: '883401', modality: 'RMN' }, requestDate: '26 Ago, 18:00', completionDate: 'N/A' },
  { id: '5', status: 'Pendiente', service: 'URG', patient: { name: 'RESTREPO, LAURA', id: '99887766', entidad: 'CAJACOPI' }, study: { name: 'ECOGRAFIA DE TEJIDOS BLANDOS', cups: '881202', modality: 'ECO' }, requestDate: '28 Ago, 16:15', completionDate: 'N/A' },
];

const statusConfig = {
    'Pendiente': { icon: Clock, className: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800/50 text-yellow-700 dark:text-yellow-300', iconClassName: 'text-yellow-600 dark:text-yellow-400', label: 'Pendiente' },
    'Completado': { icon: CheckCircle, className: 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50 text-green-700 dark:text-green-300', iconClassName: 'text-green-600 dark:text-green-400', label: 'Completado' },
    'Leído': { icon: CheckCircle, className: 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-300', iconClassName: 'text-blue-600 dark:text-blue-400', label: 'Leído' },
    'Cancelado': { icon: XCircle, className: 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300', iconClassName: 'text-red-600 dark:text-red-400', label: 'Cancelado' },
};

export function StudyTable() {
  return (
    <Card className="shadow-lg border-border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-center font-bold p-2" style={{ width: '100px'}}>Estado</TableHead>
              <TableHead className="text-center font-bold p-2" style={{ width: '85px'}}>Servicio</TableHead>
              <TableHead className="align-middle p-2 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar Paciente (Nombre / ID)" className="pl-10 h-9 bg-background"/>
                </div>
              </TableHead>
              <TableHead className="font-bold p-2 min-w-[300px]">Estudio</TableHead>
              <TableHead className="text-center font-bold p-2" style={{ width: '120px'}}>Fecha</TableHead>
              <TableHead className="p-2" style={{ width: '40px'}}></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exampleRequests.map((req) => {
              const { icon: Icon, className, iconClassName, label } = statusConfig[req.status as keyof typeof statusConfig] || statusConfig.Pendiente;
              return (
              <TableRow key={req.id} className="text-sm">
                <TableCell className="p-1 align-top h-full">
                  <div className={cn('w-full h-full flex flex-col items-center justify-center gap-1 p-2 rounded-md border', className)}>
                    <Icon className={cn('h-5 w-5', iconClassName)} />
                    <p className='text-[10px] font-bold'>{label.toUpperCase()}</p>
                  </div>
                </TableCell>
                <TableCell className="p-2 align-top text-center font-bold">{req.service}</TableCell>
                <TableCell className="p-2 align-top">
                  <div className="font-bold uppercase text-sm">{req.patient.name}</div>
                  <div className="text-muted-foreground uppercase text-xs">ID: {req.patient.id} | {req.patient.entidad}</div>
                </TableCell>
                <TableCell className="p-2 align-top">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="flex items-center justify-center w-12 h-10 border-2 font-semibold rounded-md text-sm">{req.study.modality}</Badge>
                    <div>
                      <div className="font-bold uppercase text-sm leading-tight">{req.study.name}</div>
                      <div className="text-muted-foreground text-xs font-medium">CUPS: {req.study.cups}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="p-2 align-top text-center text-xs space-y-1">
                  <div className="font-medium text-red-600">{req.requestDate}</div>
                  <div className="font-medium text-green-600">{req.completionDate}</div>
                </TableCell>
                <TableCell className="p-1 text-right align-top">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Cancelar</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )})}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
