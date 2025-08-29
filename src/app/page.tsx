
"use client";

import { useState, useEffect } from 'react';
import { AppHeader } from "@/components/app/app-header";
import { NewRequestCard } from "@/components/app/new-request-card";
import { StudyTable } from "@/components/app/study-table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Study } from '@/lib/types';


type Summary = {
  ECO: number;
  RX: number;
  TAC: number;
  RMN: number;
};

type ServiceSummary = {
    URG: number;
    HOS: number;
    UCI: number;
}

export default function HomePage() {
  const [summary, setSummary] = useState<Summary>({ ECO: 0, RX: 0, TAC: 0, RMN: 0 });
  const [serviceSummary, setServiceSummary] = useState<ServiceSummary>({ URG: 0, HOS: 0, UCI: 0 });
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, "studies"), where("status", "==", "Pendiente"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const studiesData: Study[] = [];
        const newSummary: Summary = { ECO: 0, RX: 0, TAC: 0, RMN: 0 };
        const newServiceSummary: ServiceSummary = { URG: 0, HOS: 0, UCI: 0 };
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            // Populate studies data for the table
            const firstStudy = data.studies && data.studies.length > 0 ? data.studies[0] : {};
             studiesData.push({
                id: doc.id,
                status: data.status || 'Pendiente',
                service: data.service || 'N/A',
                patient: {
                    fullName: data.patient?.fullName || 'N/A',
                    id: data.patient?.id || 'N/A',
                    entidad: data.patient?.entidad || 'N/A',
                },
                studies: [{
                    nombre: firstStudy.nombre || 'N/A',
                    cups: firstStudy.cups || 'N/A',
                    modality: (firstStudy.nombre?.slice(0, 3) || 'N/A').toUpperCase(),
                }],
                requestDate: data.requestDate,
                completionDate: data.completionDate,
            });

            // Calculate summaries
            if (data.studies && data.studies.length > 0) {
                const modality = (data.studies[0].nombre?.slice(0, 3) || 'N/A').toUpperCase();
                if (modality in newSummary) {
                    newSummary[modality as keyof Summary]++;
                }
            }
            const service = data.service?.toUpperCase();
             if (service && service in newServiceSummary) {
                newServiceSummary[service as keyof ServiceSummary]++;
            }
        });

        setStudies(studiesData);
        setFilteredStudies(studiesData);
        setSummary(newSummary);
        setServiceSummary(newServiceSummary);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = studies.filter(item => {
      return (
        item.patient.fullName.toLowerCase().includes(lowercasedFilter) ||
        item.patient.id.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredStudies(filteredData);
  }, [searchTerm, studies]);


  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <AppHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <NewRequestCard />

          <Card className="shadow-lg border-border xl:col-span-2 flex flex-col">
            <CardHeader className="p-4">
              <CardTitle className="font-headline font-semibold text-lg text-foreground">
                Resumen de Estudios Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">{summary.ECO}</p>
                <p className="text-sm text-muted-foreground">ECO</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">{summary.RX}</p>
                <p className="text-sm text-muted-foreground">RX</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">{summary.TAC}</p>
                <p className="text-sm text-muted-foreground">TAC</p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold font-headline">{summary.RMN}</p>
                <p className="text-sm text-muted-foreground">RMN</p>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-100 p-3 rounded-lg text-center border border-red-200 dark:bg-red-900/20 dark:border-red-800/50">
                <p className="text-xl font-bold font-headline text-red-800 dark:text-red-300">{serviceSummary.URG}</p>
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">Urgencias</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg text-center border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50">
                <p className="text-xl font-bold font-headline text-blue-800 dark:text-blue-300">{serviceSummary.HOS}</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Hospitalización</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg text-center border border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50">
                <p className="text-xl font-bold font-headline text-purple-800 dark:text-purple-300">{serviceSummary.UCI}</p>
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">UCI</p>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <StudyTable 
            studies={filteredStudies} 
            loading={studies.length === 0} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            />
        </div>
      </main>
    </div>
  );
}
