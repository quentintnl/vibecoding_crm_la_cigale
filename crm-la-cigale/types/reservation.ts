/**
 * Types pour le CRM Réservations - La Cigale
 * Source of Truth : Airtable
 */

/**
 * Statut de la réservation basé sur le champ is_here
 * - A_VENIR : Client pas encore arrivé (is_here = 0)
 * - ARRIVE : Client arrivé (is_here = 1)
 */
export type ReservationStatut = 'A_VENIR' | 'ARRIVE';

/**
 * Modèle de Réservation (côté application)
 * Mappé depuis les champs Airtable
 */
export interface Reservation {
  /** ID Airtable (recordId) */
  id: string;

  /** Nom du client */
  nom: string;

  /** Date de réservation (format ISO : YYYY-MM-DD) */
  date: string;

  /** Heure d'arrivée prévue (format HH:mm) */
  heure: string;

  /** Nombre de personnes */
  nbPersonnes: number;

  /** Numéro de téléphone du client (optionnel) */
  telephone?: string;

  /** Notes ou demandes spéciales (optionnel) */
  notes?: string;

  /** Statut de présence */
  statut: ReservationStatut;
}

/**
 * Structure brute des champs Airtable
 * Correspond exactement au schéma CSV/Airtable
 */
export interface AirtableReservationFields {
  heure_arrivee: string;
  date_reservation: string;
  nom_client: string;
  nombre_personnes: number;
  numero_telephone?: string;
  champ_complementaire?: string;
  is_here: number; // 0 ou 1
}

/**
 * Données pour créer une réservation (sans ID)
 */
export type CreateReservationData = Omit<Reservation, 'id'>;

/**
 * Données pour mettre à jour une réservation (partiel)
 */
export type UpdateReservationData = Partial<Omit<Reservation, 'id'>>;

/**
 * Filtres pour la récupération des réservations
 */
export interface ReservationFilters {
  date?: string; // ISO format YYYY-MM-DD
  statut?: ReservationStatut;
}

