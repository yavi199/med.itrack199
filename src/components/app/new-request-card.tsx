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
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '../ui/button';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export function NewRequestCard() {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractOrderOutput | null>(null);
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
                    console.log("Extracted data:", result);
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

    const handleCreateRequest = async () => {
        if (!extractedData) return;
    
        setLoading(true);
        try {
            const studyData = {
                patient: extractedData.patient,
                studies: extractedData.studies,
                diagnosis: extractedData.diagnosis,
                status: 'Pendiente',
                requestDate: serverTimestamp(),
                completionDate: null,
                service: 'URG', // Default value, can be changed later
            };

            const docRef = await addDoc(collection(db, "studies"), studyData);

            toast({
                title: "Solicitud Creada",
                description: `Solicitud para ${extractedData.patient.fullName} ha sido creada con el ID: ${docRef.id}.`,
            });
            console.log("Creating request with data:", extractedData);
            setExtractedData(null);
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
            console.log("Generating authorization for data:", extractedData);
            setExtractedData(null);
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
                            {loading ? (
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
                            disabled={loading}
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
                        <Button onClick={handleCreateRequest} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Crear Solicitud
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
