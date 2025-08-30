
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from "@/components/app/app-header";
import { NewRequestCard } from "@/components/app/new-request-card";
import { StudyTable } from "@/components/app/study-table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Study } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';


type Summary = {
  ECO: number;
  RX: number;
  TAC: number;
  RMN: number;
};

type ServiceSummary = {
    URG: number;
    HOSP: number;
    UCI: number;
    'C. EXT': number;
}

type ActiveFilters = {
    modalities: string[];
    services: string[];
}

const getModality = (studyName: string): string => {
    const name = studyName.toUpperCase();
    if (name.includes('TOMOGRAFIA') || name.includes('TAC')) return 'TAC';
    if (name.includes('ECOGRAFIA')) return 'ECO';
    if (name.includes('RESONANCIA') || name.includes('RMN')) return 'RMN';
    if (name.includes('RAYOS X') || name.includes('RX')) return 'RX';
    return (name.slice(0, 3) || 'N/A');
}

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState<Summary>({ ECO: 0, RX: 0, TAC: 0, RMN: 0 });
  const [serviceSummary, setServiceSummary] = useState<ServiceSummary>({ URG: 0, HOSP: 0, UCI: 0, 'C. EXT': 0 });
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ modalities: [], services: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "studies"), orderBy("requestDate", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studiesData: Study[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const firstStudy = data.studies && data.studies.length > 0 ? data.studies[0] : {};
            const modality = getModality(firstStudy.nombre || '');
            
            let service = (data.service || 'N/A').toUpperCase();
            if (service === 'C.EXT') service = 'C. EXT';


             studiesData.push({
                id: doc.id,
                status: data.status || 'Pendiente',
                service: service,
                patient: {
                    fullName: data.patient?.fullName || 'N/A',
                    id: data.patient?.id || 'N/A',
                    entidad: data.patient?.entidad || 'N/A',
                    birthDate: data.patient?.birthDate,
                    sex: data.patient?.sex
                },
                studies: [{
                    nombre: firstStudy.nombre || 'N/A',
                    cups: firstStudy.cups || 'N/A',
                    modality: modality,
                }],
                diagnosis: {
                    code: data.diagnosis?.code || 'N/A',
                    description: data.diagnosis?.description || 'N/A',
                },
                requestDate: data.requestDate,
                completionDate: data.completionDate,
                cancellationReason: data.cancellationReason
            });
        });

        setStudies(studiesData);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    let filteredData = studies;
    const lowercasedFilter = searchTerm.toLowerCase();

    // Filter by search term
    if (searchTerm) {
        filteredData = filteredData.filter(item => {
            return (
                item.patient.fullName.toLowerCase().includes(lowercasedFilter) ||
                item.patient.id.toLowerCase().includes(lowercasedFilter)
            );
        });
    }
    
    // Filter by active modalities
    if (activeFilters.modalities.length > 0) {
        filteredData = filteredData.filter(item => 
            activeFilters.modalities.includes(item.studies[0].modality)
        );
    }

    // Filter by active services
    if (activeFilters.services.length > 0) {
        filteredData = filteredData.filter(item =>
            activeFilters.services.includes(item.service)
        );
    }
    
    setFilteredStudies(filteredData);
    
    // Recalculate summary counts for pending studies
    const pendingStudies = studies.filter(s => s.status === 'Pendiente');
    const newSummary: Summary = { ECO: 0, RX: 0, TAC: 0, RMN: 0 };
    const newServiceSummary: ServiceSummary = { URG: 0, HOSP: 0, UCI: 0, 'C. EXT': 0 };

    pendingStudies.forEach(study => {
        const modality = study.studies[0].modality;
        if (modality in newSummary) {
            newSummary[modality as keyof Summary]++;
        }
        const service = study.service;
        if (service in newServiceSummary) {
            newServiceSummary[service as keyof ServiceSummary]++;
        }
    });
    
    setSummary(newSummary);
    setServiceSummary(newServiceSummary);


  }, [searchTerm, studies, activeFilters]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const toggleFilter = (type: 'modalities' | 'services', value: string) => {
    setActiveFilters(prev => {
        const currentFilters = prev[type];
        const newFilters = currentFilters.includes(value)
            ? currentFilters.filter(f => f !== value)
            : [...currentFilters, value];
        return { ...prev, [type]: newFilters };
    });
  };

  const FilterButton = ({
    label,
    count,
    isActive,
    onClick,
    className = ''
  }: {
    label: string;
    count: number;
    isActive: boolean;
    onClick: () => void;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'bg-card p-4 rounded-lg text-center transition-all duration-200 border-2 shadow-lg border-border',
        isActive ? 'border-primary bg-primary/10' : 'hover:border-primary hover:bg-primary/10',
        className
      )}
    >
      <p className="text-3xl font-bold font-headline">{count}</p>
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
    </button>
  );


  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <NewRequestCard />

          <Card className="shadow-lg border-border xl:col-span-2 flex flex-col">
            <CardHeader className="p-4">
              <CardTitle className="font-headline font-semibold text-lg text-foreground">
                Resumen y Filtros de Estudios Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary).map(([key, value]) => (
                <FilterButton
                    key={key}
                    label={key}
                    count={value}
                    isActive={activeFilters.modalities.includes(key)}
                    onClick={() => toggleFilter('modalities', key)}
                />
              ))}
            </CardContent>
            <CardFooter className="p-4 pt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
               {Object.entries(serviceSummary).map(([key, value]) => (
                <FilterButton
                    key={key}
                    label={key}
                    count={value}
                    isActive={activeFilters.services.includes(key)}
                    onClick={() => toggleFilter('services', key)}
                />
              ))}
            </CardFooter>
          </Card>
        </div>

        <div>
          <StudyTable 
            studies={filteredStudies} 
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            />
        </div>
      </main>
    </div>
  );
}

    