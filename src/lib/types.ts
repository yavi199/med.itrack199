
export type Study = {
    id: string;
    status: string;
    service: string;
    patient: {
        fullName: string;
        id: string;
        entidad: string;
    };
    studies: {
        nombre: string;
        cups: string;
        modality: string;
    }[];
    requestDate: {
        toDate: () => Date;
    } | null;
    completionDate: {
        toDate: () => Date;
    } | null;
};
