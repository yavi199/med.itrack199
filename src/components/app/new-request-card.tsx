"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { extractOrder } from '@/ai/flows/extract-order-flow';
import { cn } from '@/lib/utils';

export function NewRequestCard() {
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
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
                    toast({
                        title: "Extracción Exitosa",
                        description: `Paciente: ${result.patient.fullName}`,
                    });
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
    
    return (
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
    );
}
