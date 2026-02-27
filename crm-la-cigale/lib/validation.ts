/**
 * Schémas de validation Zod pour les réservations
 * Utilisés pour valider les données côté serveur (API Routes)
 */

import { z } from 'zod';

/**
 * Schéma pour créer une réservation
 */
export const createReservationSchema = z.object({
  nom: z.string().min(1, 'Le nom est obligatoire').max(100, 'Le nom est trop long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD attendu)'),
  heure: z.string().min(1, 'L\'heure est obligatoire'),
  nbPersonnes: z.number().int().min(1, 'Le nombre de personnes doit être au moins 1').max(50, 'Nombre de personnes trop élevé'),
  telephone: z.string().optional(),
  notes: z.string().optional(),
  statut: z.enum(['A_VENIR', 'ARRIVE']).default('A_VENIR'),
});

/**
 * Schéma pour mettre à jour une réservation (tous les champs optionnels)
 */
export const updateReservationSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  heure: z.string().min(1).optional(),
  nbPersonnes: z.number().int().min(1).max(50).optional(),
  telephone: z.string().optional(),
  notes: z.string().optional(),
  statut: z.enum(['A_VENIR', 'ARRIVE']).optional(),
});

/**
 * Schéma pour mettre à jour uniquement le statut
 */
export const updateStatusSchema = z.object({
  isArrived: z.boolean(),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

