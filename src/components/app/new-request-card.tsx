"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { extractOrder, ExtractOrderOutput } from '@/ai/flows/extract-order-flow';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Label } from '../ui/label';


export function NewRequestCard() {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractOrderOutput | null>(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [patientId, setPatientId] = useState('');
    const { toast } = useToast();

    const handleFileChange = async (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                toast({
                    variant: "destructive",
                    title: "Archivo no válido",
                    description: "Por favor, sube una imagen o un PDF.",
                });
                return;
            }
            setLoading(true);

            const reader = new FileReader();
            reader.onload = async (e) => {
                const dataUri = e.target?.result as string;
                try {
                    const result = await extractOrder({ fileDataUri: dataUri });
                    setExtractedData(result);
                } catch (error) {
                    toast({
                        variant: "destructive",
                        title: "Error de Extracción",
                        description: "No se pudo procesar el archivo. Intente de nuevo.",
                    });
                    console.error("Extraction error:", error);
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        const files = e.dataTransfer.files;
        handleFileChange(files);
    };

    const handleCreateRequest = async (dataToSave: ExtractOrderOutput | null) => {
        if (!dataToSave) return;

        setLoading(true);
        try {
            // Ensure data is plain objects for Firestore
            const studyData = {
                patient: { ...dataToSave.patient },
                studies: dataToSave.studies.map(s => ({ ...s })),
                diagnosis: { ...dataToSave.diagnosis },
                physician: { ...dataToSave.physician },
                order: { ...dataToSave.order },
                status: 'Pendiente',
                requestDate: serverTimestamp(),
                completionDate: null,
                service: 'URG',
            };

            const docRef = await addDoc(collection(db, "studies"), studyData);

            toast({
                title: "Solicitud Creada",
                description: `Solicitud para ${dataToSave.patient?.fullName} ha sido creada con el ID: ${docRef.id}.`,
            });
            setExtractedData(null);
            setShowManualEntry(false);
            setPatientId('');
        } catch (error) {
            console.error("Error creating request: ", error);
            toast({
                variant: "destructive",
                title: "Error al Crear Solicitud",
                description: "No se pudo guardar la solicitud en la base de datos.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAuthorization = () => {
        if (extractedData) {
            toast({
                title: "Generando Autorización",
                description: `Se está generando la autorización para ${extractedData.patient.fullName}.`,
            });
            // Logic to generate PDF will be added here
            setExtractedData(null);
        }
    };

    const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: ExtractOrderOutput = {
            patient: {
                id: formData.get('patientId') as string,
                fullName: formData.get('fullName') as string,
                birthDate: formData.get('birthDate') as string,
                sex: formData.get('sex') as string,
                entidad: formData.get('entidad') as string,
            },
            studies: [{
                cups: formData.get('cups') as string,
                nombre: formData.get('studyName') as string,
                details: formData.get('studyDetails') as string,
            }],
            diagnosis: {
                code: formData.get('cie10') as string,
                description: formData.get('diagnosisDescription') as string,
            },
            physician: {
                fullName: formData.get('physicianName') as string,
                registryNumber: formData.get('physicianRegistry') as string,
                specialty: formData.get('physicianSpecialty') as string,
            },
            order: {
                date: formData.get('orderDate') as string,
                institutionName: formData.get('institutionName') as string,
                admissionNumber: formData.get('admissionNumber') as string,
            }
        };
        handleCreateRequest(data);
    };

    const handleIdInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && patientId) {
            e.preventDefault();
            setShowManualEntry(true);
        }
    };
    
    return (
        <>
            <Card className="shadow-lg border-border xl:col-span-1 flex flex-col">
                <CardHeader className="p-4">
                    <CardTitle className="font-headline font-semibold text-lg text-foreground">Nueva Solicitud</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-grow flex flex-col gap-4">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept="image/*,application/pdf"
                        disabled={loading}
                    />
                    <label
                        htmlFor="file-upload"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center flex flex-col items-center justify-center h-full w-full bg-primary/10 border-primary/40 transition-colors",
                            !loading && "cursor-pointer hover:border-primary",
                            dragging && "border-primary bg-primary/20"
                        )}
                    >
                        <div className="flex flex-col items-center justify-center gap-2 text-primary-foreground">
                            {loading && !extractedData && !showManualEntry ? (
                                <>
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <p className="text-sm font-semibold text-foreground">Procesando...</p>
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="h-8 w-8 text-primary" />
                                    <p className="text-sm font-semibold text-foreground">Cargar Orden (PDF o Foto)</p>
                                    <p className="text-xs text-muted-foreground">o arrastra y suelta aquí</p>
                                </>
                            )}
                        </div>
                    </label>
                    <div className="relative mt-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Crear solicitud por ID de paciente"
                            className="pl-10 h-10 text-sm"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            onKeyDown={handleIdInputKeyDown}
                            disabled={loading}
                            suppressHydrationWarning
                        />
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={!!extractedData} onOpenChange={(open) => !open && setExtractedData(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Orden Procesada Exitosamente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se ha extraído la información de la orden para el paciente <span className="font-bold">{extractedData?.patient.fullName}</span>. ¿Qué deseas hacer a continuación?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-between gap-2">
                        <Button variant="outline" onClick={handleGenerateAuthorization}>Generar Autorización PDF</Button>
                        <Button onClick={() => handleCreateRequest(extractedData)} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Solicitud
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showManualEntry} onOpenChange={(open) => { if (!open) { setShowManualEntry(false); setPatientId(''); } }}>
                <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleManualSubmit}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Crear Solicitud Manual</AlertDialogTitle>
                            <AlertDialogDescription>
                                Ingrese los detalles para el paciente con ID: <span className="font-bold">{patientId}</span>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="grid gap-4 py-4">
                             <h3 className="font-semibold text-sm">Datos del Paciente</h3>
                             <div className="space-y-2">
                                <Label htmlFor="patientId">Documento del Paciente</Label>
                                <Input id="patientId" name="patientId" defaultValue={patientId} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Nombre Completo</Label>
                                    <Input id="fullName" name="fullName" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">Fecha Nacimiento</Label>
                                    <Input id="birthDate" name="birthDate" type="date" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sex">Sexo</Label>
                                    <Input id="sex" name="sex" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="entidad">Entidad/Aseguradora</Label>
                                    <Input id="entidad" name="entidad" required />
                                </div>
                            </div>

                            <h3 className="font-semibold text-sm pt-4">Datos de la Orden</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="orderDate">Fecha de la Orden</Label>
                                    <Input id="orderDate" name="orderDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="institutionName">Institución</Label>
                                    <Input id="institutionName" name="institutionName" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="admissionNumber">Número de Admisión</Label>
                                <Input id="admissionNumber" name="admissionNumber" />
                            </div>
                            
                            <h3 className="font-semibold text-sm pt-4">Datos del Estudio</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cups">CUPS</Label>
                                    <Input id="cups" name="cups" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="studyName">Nombre del Estudio</Label>
                                    <Input id="studyName" name="studyName" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studyDetails">Detalles del Estudio</Label>
                                <Input id="studyDetails" name="studyDetails" />
                            </div>

                             <h3 className="font-semibold text-sm pt-4">Datos del Diagnóstico</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="cie10">CIE-10</Label>
                                    <Input id="cie10" name="cie10" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosisDescription">Descripción Diagnóstico</Label>
                                    <Input id="diagnosisDescription" name="diagnosisDescription" required />
                                </div>
                            </div>

                             <h3 className="font-semibold text-sm pt-4">Datos del Médico</h3>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="physicianName">Nombre del Médico</Label>
                                    <Input id="physicianName" name="physicianName" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="physicianRegistry">Registro Médico</Label>
                                    <Input id="physicianRegistry" name="physicianRegistry" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="physicianSpecialty">Especialidad</Label>
                                <Input id="physicianSpecialty" name="physicianSpecialty" required />
                            </div>
                        </div>
                        <AlertDialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setShowManualEntry(false); setPatientId(''); }} disabled={loading}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Solicitud
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

    