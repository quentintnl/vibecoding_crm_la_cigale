/**
 * API Route : /api/reservations/[id]
 * Gestion d'une réservation spécifique
 *
 * PUT    /api/reservations/[id]  - Met à jour une réservation
 * DELETE /api/reservations/[id]  - Supprime une réservation
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateReservation, deleteReservation, updateReservationStatus } from '@/lib/airtable';
import { updateReservationSchema, updateStatusSchema } from '@/lib/validation';
import { ZodError } from 'zod';

/**
 * PUT /api/reservations/[id]
 * Met à jour une réservation existante
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Cas spécial : mise à jour uniquement du statut
    if ('isArrived' in body && Object.keys(body).length === 1) {
      const validatedData = updateStatusSchema.parse(body);
      const updatedReservation = await updateReservationStatus(id, validatedData.isArrived);

      return NextResponse.json({
        success: true,
        data: updatedReservation,
      });
    }

    // Mise à jour complète
    const validatedData = updateReservationSchema.parse(body);
    const updatedReservation = await updateReservation(id, validatedData);

    return NextResponse.json({
      success: true,
      data: updatedReservation,
    });
  } catch (error) {
    console.error('Erreur PUT /api/reservations/[id]:', error);

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
 * DELETE /api/reservations/[id]
 * Supprime une réservation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteReservation(id);

    return NextResponse.json({
      success: true,
      message: 'Réservation supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE /api/reservations/[id]:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur inconnue',
      },
      { status: 500 }
    );
  }
}


