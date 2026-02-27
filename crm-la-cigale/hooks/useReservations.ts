/**
 * Hooks personnalisés pour la gestion des réservations côté client
 * Utilise SWR pour le cache et la revalidation automatique
 */

import useSWR from 'swr';
import { Reservation, CreateReservationData, UpdateReservationData } from '@/types/reservation';

// Fetcher générique pour SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * Hook pour récupérer toutes les réservations
 */
export function useReservations(filters?: { date?: string; statut?: string }) {
  const queryParams = new URLSearchParams();
  if (filters?.date) queryParams.set('date', filters.date);
  if (filters?.statut) queryParams.set('statut', filters.statut);

  const url = `/api/reservations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    reservations: data?.data as Reservation[] | undefined,
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Crée une nouvelle réservation
 */
export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  const response = await fetch('/api/reservations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la création');
  }

  return result.data;
}

/**
 * Met à jour une réservation existante
 */
export async function updateReservation(
  id: string,
  data: UpdateReservationData
): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la mise à jour');
  }

  return result.data;
}

/**
 * Met à jour uniquement le statut d'une réservation
 */
export async function updateReservationStatus(
  id: string,
  isArrived: boolean
): Promise<Reservation> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isArrived }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la mise à jour du statut');
  }

  return result.data;
}

/**
 * Supprime une réservation
 */
export async function deleteReservation(id: string): Promise<void> {
  const response = await fetch(`/api/reservations/${id}`, {
    method: 'DELETE',
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Erreur lors de la suppression');
  }
}

