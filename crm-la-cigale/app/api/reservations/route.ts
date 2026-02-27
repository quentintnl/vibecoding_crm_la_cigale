/**
 * API Route : /api/reservations
 * Gestion CRUD des réservations
 *
 * GET    /api/reservations       - Liste toutes les réservations
 * POST   /api/reservations       - Crée une nouvelle réservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getReservations, createReservation } from '@/lib/airtable';
import { createReservationSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * GET /api/reservations
 * Récupère toutes les réservations
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de query optionnels
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || undefined;
    const statut = searchParams.get('statut') as 'A_VENIR' | 'ARRIVE' | undefined;

    const reservations = await getReservations({ date, statut });

    return NextResponse.json({
      success: true,
      data: reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur inconnue',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reservations
 * Crée une nouvelle réservation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données avec Zod
    const validatedData = createReservationSchema.parse(body);

    // Création dans Airtable
    const newReservation = await createReservation(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: newReservation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur POST /api/reservations:', error);

    // Erreur de validation Zod
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Autres erreurs
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur inconnue',
      },
      { status: 500 }
    );
  }
}


