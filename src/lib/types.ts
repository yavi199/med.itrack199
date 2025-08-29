
export type Study = {
    id: string;
    status: string;
    service: string;
    patient: {
        fullName: string;
        id: string;
        entidad: string;
        birthDate?: string;
    };
    studies: {
        nombre: string;
        cups: string;
        modality: string;
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

    