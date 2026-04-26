'use client';

import { createContext, useContext, ReactNode } from 'react';
import { db } from './instant';
import { useAuth } from './auth-context';
import { Farm } from '@/types';

type FarmContextType = {
  farm: Farm | null;
  isLoading: boolean;
};

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // Query the user's farm
  const farmQuery = user
    ? {
        farms: {
          $: {
            where: {
              ownerId: user.id,
            },
          },
        },
      }
    : null;

  const { isLoading: queryLoading, error, data } = db.useQuery(farmQuery as any) as {
    isLoading: boolean;
    error?: any;
    data?: { farms?: any[] };
  };

  // When there is no user, skip the query — don't let isLoading hang forever
  const isLoading = user ? queryLoading : false;

  const farm = data?.farms?.[0]
    ? {
        id: data.farms[0].id,
        name: data.farms[0].name,
        location: data.farms[0].location,
        imtaStartDate: new Date(data.farms[0].imtaStartDate).toISOString(),
        createdAt: new Date(data.farms[0].createdAt).toISOString(),
        ownerId: data.farms[0].ownerId,
        initialStockingDensity: data.farms[0].initialStockingDensity ?? 0,
      }
    : null;

  return (
    <FarmContext.Provider value={{ farm, isLoading }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}

