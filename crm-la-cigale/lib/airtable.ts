/**
 * Data Access Layer (DAL) - Airtable
 * Module d'isolation de la logique de communication avec Airtable
 *
 * ⚠️ Ce module doit UNIQUEMENT être utilisé côté serveur (API Routes)
 * JAMAIS côté client pour protéger les secrets
 */

import Airtable, { FieldSet, Records } from 'airtable';
import { parse, format } from 'date-fns';
import {
  Reservation,
  AirtableReservationFields,
  CreateReservationData,
  UpdateReservationData,
  ReservationFilters,
} from '@/types/reservation';

// Configuration Airtable depuis les variables d'environnement
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Reservations';

// Validation de la configuration
if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  throw new Error(
    '❌ Configuration Airtable manquante ! Vérifiez AIRTABLE_PAT et AIRTABLE_BASE_ID dans .env.local'
  );
}

// Configuration du client Airtable
Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_PAT,
});

// Initialisation de la base
const airtableBase = Airtable.base(AIRTABLE_BASE_ID);

/**
 * Convertit une date du format DD/MM/YYYY vers ISO YYYY-MM-DD
 */
function parseDateFromAirtable(dateStr: string): string {
  try {
    // Format attendu : "16/01/2026"
    const parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    return format(parsed, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Erreur parsing date:', dateStr, error);
    return dateStr; // Fallback
  }
}

/**
 * Convertit une date du format ISO YYYY-MM-DD vers DD/MM/YYYY pour Airtable
 */
function formatDateForAirtable(isoDate: string): string {
  try {
    const parsed = parse(isoDate, 'yyyy-MM-dd', new Date());
    return format(parsed, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Erreur formatage date:', isoDate, error);
    return isoDate; // Fallback
  }
}

/**
 * Convertit un record Airtable vers le modèle Reservation
 */
function mapAirtableToReservation(record: Records<FieldSet>[0]): Reservation {
  const fields = record.fields as unknown as AirtableReservationFields;

  return {
    id: record.id,
    nom: fields.nom_client || '',
    date: parseDateFromAirtable(fields.date_reservation),
    heure: fields.heure_arrivee || '',
    nbPersonnes: fields.nombre_personnes || 0,
    telephone: fields.numero_telephone || undefined,
    notes: fields.champ_complementaire || undefined,
    statut: fields.is_here === 1 ? 'ARRIVE' : 'A_VENIR',
  };
}

/**
 * Convertit le modèle Reservation vers les champs Airtable
 */
function mapReservationToAirtable(data: CreateReservationData | UpdateReservationData): Partial<AirtableReservationFields> {
  const fields: Partial<AirtableReservationFields> = {};

  if ('nom' in data && data.nom !== undefined) fields.nom_client = data.nom;
  if ('date' in data && data.date !== undefined) fields.date_reservation = formatDateForAirtable(data.date);
  if ('heure' in data && data.heure !== undefined) fields.heure_arrivee = data.heure;
  if ('nbPersonnes' in data && data.nbPersonnes !== undefined) fields.nombre_personnes = data.nbPersonnes;
  if ('telephone' in data && data.telephone !== undefined) fields.numero_telephone = data.telephone;
  if ('notes' in data && data.notes !== undefined) fields.champ_complementaire = data.notes;
  if ('statut' in data && data.statut !== undefined) fields.is_here = data.statut === 'ARRIVE' ? 1 : 0;

  return fields;
}

/**
 * 1. Récupère la liste des réservations
 * @param filters - Filtres optionnels (date, statut)
 * @returns Promise<Reservation[]>
 */
export async function getReservations(filters?: ReservationFilters): Promise<Reservation[]> {
  try {
    const records = await airtableBase(AIRTABLE_TABLE_NAME).select({
      sort: [{ field: 'date_reservation', direction: 'asc' }],
    }).all();
    console.log(records)

    let reservations = records.map(mapAirtableToReservation);

    // Appliquer les filtres côté application si nécessaire
    if (filters?.date) {
      reservations = reservations.filter(r => r.date === filters.date);
    }
    if (filters?.statut) {
      reservations = reservations.filter(r => r.statut === filters.statut);
    }

    return reservations;
  } catch (error) {
    console.error('❌ Erreur getReservations:', error);
    throw new Error('Impossible de récupérer les réservations depuis Airtable');
  }
}

/**
 * 2. Crée une nouvelle réservation
 * @param data - Données de la réservation (sans ID)
 * @returns Promise<Reservation> - La réservation créée avec son ID
 */
export async function createReservation(data: CreateReservationData): Promise<Reservation> {
  try {
    const fields = mapReservationToAirtable(data);

    const record = await airtableBase(AIRTABLE_TABLE_NAME).create(fields as FieldSet);

    return mapAirtableToReservation(record);
  } catch (error) {
    console.error('❌ Erreur createReservation:', error);
    throw new Error('Impossible de créer la réservation dans Airtable');
  }
}

/**
 * 3. Met à jour uniquement le statut is_here d'une réservation
 * @param id - ID Airtable du record
 * @param isArrived - true si arrivé, false sinon
 * @returns Promise<Reservation>
 */
export async function updateReservationStatus(id: string, isArrived: boolean): Promise<Reservation> {
  try {
    const record = await airtableBase(AIRTABLE_TABLE_NAME).update(id, {
      is_here: isArrived ? 1 : 0,
    } as FieldSet);

    return mapAirtableToReservation(record);
  } catch (error) {
    console.error('❌ Erreur updateReservationStatus:', error);
    throw new Error('Impossible de mettre à jour le statut de la réservation');
  }
}

/**
 * 4. Met à jour les détails d'une réservation
 * @param id - ID Airtable du record
 * @param data - Données à mettre à jour (partiel)
 * @returns Promise<Reservation>
 */
export async function updateReservation(id: string, data: UpdateReservationData): Promise<Reservation> {
  try {
    const fields = mapReservationToAirtable(data);

    const record = await airtableBase(AIRTABLE_TABLE_NAME).update(id, fields as FieldSet);

    return mapAirtableToReservation(record);
  } catch (error) {
    console.error('❌ Erreur updateReservation:', error);
    throw new Error('Impossible de mettre à jour la réservation');
  }
}

/**
 * 5. Supprime une réservation
 * @param id - ID Airtable du record
 * @returns Promise<void>
 */
export async function deleteReservation(id: string): Promise<void> {
  try {
    await airtableBase(AIRTABLE_TABLE_NAME).destroy(id);
  } catch (error) {
    console.error('❌ Erreur deleteReservation:', error);
    throw new Error('Impossible de supprimer la réservation');
  }
}


