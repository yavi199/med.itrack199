
export type UserRole = "administrador" | "enfermero" | "tecnologo" | "transcriptora";

export type Service = "TAC" | "RX" | "ECO" | "MAMO" | "DENSITOMETRIA" | "RMN" | "General";

export type UserProfile = {
    uid: string;
    nombre: string;
    email: string;
    rol: UserRole;
    servicioAsignado: Service;
    activo: boolean;
};

export type Order = {
    id: string;
    infoPaciente: {
        fullName: string;
        id: string;
        entidad: string;
        birthDate?: string;
        sex?: string;
    };
    fechaCreacion: { toDate: () => Date; } | null;
    creadoPorUID: string;
    servicio: string;
    areaGeneral: string;
    subServicio: string;
    estado: "Pendiente" | "Agendado" | "En Proceso" | "Leído" | "Completado" | "Cancelado";
    urlPdfOrden?: string;
    urlPdfInforme?: string;
    historialEstado: {
        usuarioUID: string;
        fecha: any; 
        estadoAnterior: string;
        estadoNuevo: string;
    }[];
    // Legacy fields for compatibility. Can be removed after migration.
    patient?: any;
    studies?: any;
    diagnosis?: any;
    requestDate?: any;
    completionDate?: any;
    cancellationReason?: any;
    status?: any;
};
    
// This is the type we will use in the UI, which is slightly different from the DB structure
export type Study = {
    id: string;
    status: string;
    service: string;
    patient: {
        fullName: string;
        id: string;
        entidad: string;
        birthDate?: string;
        sex?: string;
    };
    studies: {
        nombre: string;
        cups: string;
        modality: string;
        details?: string;
    }[];
    diagnosis: {
        code: string;
        description: string;
    };
    requestDate: {
        toDate: () => Date;
    } | null;
    completionDate: {
        toDate: () => Date;
    } | null;
    cancellationReason?: string;
};
