import { useQuery } from '@tanstack/react-query';
import { Axios } from '@/lib/axios';
import type { BaseResponse } from '../_types';

export interface CountryOption {
  name: string;
  iso: string;
  phoneCode?: string;
  flag?: string;
}

export interface StateOption {
  name: string;
  iso: string;
}

export const useCountriesQuery = () =>
  useQuery({
    queryKey: ['locations', 'countries'],
    queryFn: () => Axios.get<unknown, BaseResponse<CountryOption[]>>('/locations/countries'),
    staleTime: Infinity,
  });

export const useStatesQuery = (countryIso?: string) =>
  useQuery({
    queryKey: ['locations', 'states', countryIso],
    queryFn: () =>
      Axios.get<unknown, BaseResponse<StateOption[]>>(`/locations/countries/${countryIso}/states`),
    enabled: !!countryIso,
    staleTime: Infinity,
  });
