
"use client"

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Search, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Card } from '../ui/card';
import { cn } from "@/lib/utils";
import { format, differenceInYears } from 'date-fns';
import { Study } from "@/lib/types";
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type StudyTableProps = {
    studies: Study[];
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
};

const statusConfig = {
    'Pendiente': { icon: Clock, className: 'bg-red-600 dark:bg-red-700 border-red-600 dark:border-red-700 text-white dark:text-white', iconClassName: 'text-white dark:text-white', label: 'Pendiente' },
    'Completado': { icon: CheckCircle, className: 'bg-green-600 dark:bg-green-700 border-green-600 dark:border-green-700 text-white dark:text-white', iconClassName: 'text-white dark:text-white', label: 'Completado' },
    'Leído': { icon: CheckCircle, className: 'bg-blue-600 dark:bg-blue-700 border-blue-600 dark:border-blue-700 text-white dark:text-white', iconClassName: 'text-white dark:text-white', label: 'Leído' },
    'Cancelado': { icon: XCircle, className: 'bg-orange-500 dark:bg-orange-600 border-orange-500 dark:border-orange-600 text-white dark:text-white', iconClassName: 'text-white dark:text-white', label: 'Cancelado' },
};

const cancellationReasons = [
    'Creatinina elevada',
    'Sin ayuno',
    'Requiere sedación',
    'Estudio cancelado por médico',
    'Estudio mal cargado'
];

export function StudyTable({ studies, loading, searchTerm, setSearchTerm }: StudyTableProps) {
    
    const { toast } = useToast();
    const [isCancelling, setIsCancelling] = useState(false);
    const [selectedReason, setSelectedReason] = useState(cancellationReasons[0]);

    const handleStatusChange = async (studyId: string, currentStatus: string) => {
        if (currentStatus !== 'Pendiente') return;

        const studyRef = doc(db, "studies", studyId);
        try {
            await updateDoc(studyRef, {
                status: 'Completado',
                completionDate: serverTimestamp()
            });
            toast({
                title: "Estudio Actualizado",
                description: "El estado del estudio se ha cambiado a Completado.",
            });
        } catch (error) {
            console.error("Error updating study status: ", error);
            toast({
                variant: "destructive",
                title: "Error al Actualizar",
                description: "No se pudo cambiar el estado del estudio.",
            });
        }
    };
    
    const handleCancelStudy = async (studyId: string) => {
        setIsCancelling(true);
        const studyRef = doc(db, "studies", studyId);
        try {
            await updateDoc(studyRef, {
                status: 'Cancelado',
                cancellationReason: selectedReason,
                completionDate: serverTimestamp(),
            });
            toast({
                title: 'Estudio Cancelado',
                description: `El estudio ha sido marcado como cancelado. Motivo: ${selectedReason}`,
            });
        } catch (error) {
            console.error('Error cancelling study:', error);
            toast({
                variant: 'destructive',
                title: 'Error al Cancelar',
                description: 'No se pudo actualizar el estado del estudio.',
            });
        } finally {
            setIsCancelling(false);
        }
    };

    const formatDate = (dateObj: { toDate: () => Date } | null) => {
        if (!dateObj) return 'N/A';
        try {
            return format(dateObj.toDate(), "dd MMM, HH:mm");
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    const getAge = (birthDate: string | undefined) => {
        if (!birthDate) return '';
        try {
            const dob = new Date(birthDate);
            if (isNaN(dob.getTime())) return '';
            const age = differenceInYears(new Date(), dob);
            return `${age}a`;
        } catch {
            return '';
        }
    };


    return (
        <Card className="shadow-lg border-border">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="text-center font-bold p-2" style={{ width: '100px' }}>Estado</TableHead>
                            <TableHead className="text-center font-bold p-2" style={{ width: '85px' }}>Servicio</TableHead>
                            <TableHead className="align-middle p-2 min-w-[300px]">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Buscar Paciente (Nombre / ID)" 
                                        className="pl-10 h-9 bg-background"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </TableHead>
                            <TableHead className="font-bold p-2 min-w-[300px]">Estudio</TableHead>
                            <TableHead className="text-center font-bold p-2" style={{ width: '120px' }}>Fecha</TableHead>
                            <TableHead className="p-2" style={{ width: '40px' }}></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center p-8">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <p>Cargando estudios...</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : studies.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={6} className="text-center p-8">
                                    <p>No se encontraron solicitudes.</p>
                                </TableCell>
                            </TableRow>
                        ) : (
                            studies.map((req) => {
                                const { icon: Icon, className, iconClassName, label } = statusConfig[req.status as keyof typeof statusConfig] || statusConfig.Pendiente;
                                const study = req.studies[0];
                                const age = getAge(req.patient.birthDate);
                                return (
                                    <TableRow key={req.id} className="text-sm">
                                        <TableCell className="p-1 align-top h-full">
                                            <button 
                                                onClick={() => handleStatusChange(req.id, req.status)}
                                                disabled={req.status !== 'Pendiente'}
                                                className={cn(
                                                    'w-full h-full flex flex-col items-center justify-center gap-1 p-2 rounded-md border transition-colors',
                                                     className,
                                                     req.status === 'Pendiente' && 'hover:bg-opacity-80'
                                                )}
                                            >
                                                <Icon className={cn('h-5 w-5', iconClassName)} />
                                                <p className='text-[10px] font-bold'>{label.toUpperCase()}</p>
                                            </button>
                                        </TableCell>
                                        <TableCell className="p-2 align-top text-center font-bold">{req.service}</TableCell>
                                        <TableCell className="p-2 align-top max-w-[300px]">
                                            <div className="font-bold uppercase text-sm truncate">{req.patient.fullName}</div>
                                            <div className="text-muted-foreground uppercase text-xs truncate">
                                                ID: {req.patient.id} | {req.patient.entidad} | {req.patient.birthDate} ({age})
                                                {req.cancellationReason && <span className="text-orange-500 font-semibold ml-2">({req.cancellationReason})</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 align-top">
                                            <div className="flex items-start gap-3">
                                                <Badge variant="outline" className="flex items-center justify-center w-12 h-10 border-2 font-semibold rounded-md text-sm">{study.modality}</Badge>
                                                <div>
                                                    <div className="font-bold uppercase text-sm leading-tight">{study.nombre}</div>
                                                    <div className="text-muted-foreground text-xs font-medium">
                                                        <span>CUPS: {study.cups}</span>
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold ml-2">DX: {req.diagnosis.code} - {req.diagnosis.description}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="p-2 align-top text-center text-xs space-y-1">
                                            <div className="font-medium text-red-600">{formatDate(req.requestDate)}</div>
                                            <div className="font-medium text-green-600">{formatDate(req.completionDate)}</div>
                                        </TableCell>
                                        <TableCell className="p-1 text-right align-top">
                                            <AlertDialog>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>Editar</DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem
                                                                onSelect={(e) => e.preventDefault()}
                                                                disabled={req.status === 'Cancelado' || req.status === 'Completado'}
                                                            >
                                                                Cancelar
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancelar Estudio</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Selecciona un motivo para la cancelación del estudio de <span className="font-bold">{req.patient.fullName}</span>. Esta acción no se puede deshacer.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <RadioGroup defaultValue={selectedReason} onValueChange={setSelectedReason} className="my-4">
                                                        {cancellationReasons.map(reason => (
                                                            <div key={reason} className="flex items-center space-x-2">
                                                                <RadioGroupItem value={reason} id={reason} />
                                                                <Label htmlFor={reason}>{reason}</Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                    <AlertDialogAction onClick={() => handleCancelStudy(req.id)} disabled={isCancelling}>
                                                        {isCancelling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                        Confirmar Cancelación
                                                    </AlertDialogAction>
                                                    <AlertDialogCancel>Volver</AlertDialogCancel>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </Card>
    );
}

    