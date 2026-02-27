/**
 * Modal de formulaire pour créer/éditer une réservation
 * US-02, US-03
 */

'use client';

import { useState, FormEvent } from 'react';
import { Reservation } from '@/types/reservation';
import { createReservation, updateReservation } from '@/hooks/useReservations';
import { Button } from '@/components/ui/Button';
import { XMarkIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ReservationFormModalProps {
  reservation?: Reservation | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReservationFormModal({
  reservation,
  onClose,
  onSuccess,
}: ReservationFormModalProps) {
  const isEditing = !!reservation;

  // Fonction pour obtenir la date du jour au format YYYY-MM-DD
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fonction pour obtenir l'heure actuelle + 15 minutes au format HH:MM
  const getCurrentTimePlus15Min = (): string => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    nom: reservation?.nom || '',
    date: reservation?.date || getTodayDate(),
    heure: reservation?.heure || getCurrentTimePlus15Min(),
    nbPersonnes: reservation?.nbPersonnes || 2,
    telephone: reservation?.telephone || '',
    notes: reservation?.notes || '',
    statut: reservation?.statut || 'A_VENIR' as const,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation des horaires (11h - 23h)
    const [hours] = formData.heure.split(':').map(Number);
    if (hours < 11 || hours >= 23) {
      setError('Les réservations sont uniquement possibles entre 11h et 23h');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateReservation(reservation.id, formData);
      } else {
        await createReservation(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = 'block w-full rounded-lg border-0 py-2.5 px-3.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 transition-all duration-200 sm:text-sm sm:leading-6';
  const labelClasses = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {isEditing ? 'Modifier la réservation' : 'Nouvelle réservation'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-6 py-5">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nom Client */}
              <div className="md:col-span-2">
                <label htmlFor="nom" className={labelClasses}>
                  Nom du client <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className={inputClasses}
                  placeholder="Ex: Dupont"
                />
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className={labelClasses}>
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={inputClasses}
                />
              </div>

              {/* Heure */}
              <div>
                <label htmlFor="heure" className={labelClasses}>
                  Heure d'arrivée <span className="text-red-500">*</span>
                </label>
                <input
                  id="heure"
                  type="time"
                  required
                  min="11:00"
                  max="23:00"
                  value={formData.heure}
                  onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                  className={inputClasses}
                />
                <p className="mt-1 text-xs text-slate-500">Horaires : 11h - 23h</p>
              </div>

              {/* Nombre de personnes */}
              <div>
                <label htmlFor="nbPersonnes" className={labelClasses}>
                  Nombre de personnes <span className="text-red-500">*</span>
                </label>
                <input
                  id="nbPersonnes"
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={formData.nbPersonnes}
                  onChange={(e) => setFormData({ ...formData, nbPersonnes: parseInt(e.target.value) })}
                  className={inputClasses}
                />
              </div>

              {/* Téléphone */}
              <div>
                <label htmlFor="telephone" className={labelClasses}>
                  Téléphone
                </label>
                <input
                  id="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className={inputClasses}
                  placeholder="Ex: 0612345678"
                />
              </div>

              {/* Statut */}
              <div className="md:col-span-2">
                <label className={labelClasses}>
                  Statut
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    statut: formData.statut === 'A_VENIR' ? 'ARRIVE' : 'A_VENIR'
                  })}
                  className={`relative inline-flex h-11 w-52 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    formData.statut === 'ARRIVE' 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 transform rounded-full bg-white shadow-md transition-all duration-300 items-center justify-center ${
                      formData.statut === 'ARRIVE' ? 'translate-x-[10.75rem]' : 'translate-x-1'
                    }`}
                  >
                    {formData.statut === 'ARRIVE' ? (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-slate-500" />
                    )}
                  </span>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white pointer-events-none">
                    {formData.statut === 'ARRIVE' ? 'Arrivé' : 'À venir'}
                  </span>
                </button>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label htmlFor="notes" className={labelClasses}>
                  Notes / Demandes spéciales
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className={inputClasses}
                  placeholder="Ex: Allergies, table préférée, occasion spéciale..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isEditing ? 'Enregistrer' : 'Créer'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

