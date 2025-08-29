

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

    
    