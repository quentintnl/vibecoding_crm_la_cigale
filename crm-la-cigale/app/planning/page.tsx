/**
 * Vue Planning - Grille hebdomadaire des réservations
 * US-07 - Colonnes = Jours | Lignes = Heures
 */

'use client';

import { useState, useEffect } from 'react';
import { useReservations } from '@/hooks/useReservations';
import { Navigation } from '@/components/Navigation';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { Reservation } from '@/types/reservation';
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationFormModal from '@/components/ReservationFormModal';

// Heures de service (11h à 23h)
const HOURS = Array.from({ length: 13 }, (_, i) => i + 11); // 11 à 23

export default function PlanningPage() {
  const { reservations, isLoading, isError, mutate } = useReservations();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mettre à jour l'heure actuelle chaque minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Toutes les minutes
    return () => clearInterval(interval);
  }, []);

  // Filtrer les réservations pour ne montrer que celles d'aujourd'hui et futures
  // Temporairement afficher toutes les réservations pour tester
  const futureReservations = reservations || [];

  // Fonction pour calculer le retard d'une réservation
  const getReservationDelay = (reservation: Reservation): { isLate: boolean; delayMinutes: number } => {
    // Seulement pour les réservations "À venir"
    if (reservation.statut === 'ARRIVE') {
      return { isLate: false, delayMinutes: 0 };
    }

    // Seulement pour les réservations d'aujourd'hui
    const resDate = new Date(reservation.date);
    if (!isSameDay(resDate, new Date())) {
      return { isLate: false, delayMinutes: 0 };
    }

    // Extraire l'heure de la réservation
    const [hours, minutes] = reservation.heure.split(':').map(Number);
    const reservationTime = new Date(currentTime);
    reservationTime.setHours(hours, minutes, 0, 0);

    // Calculer la différence en minutes
    const diffMs = currentTime.getTime() - reservationTime.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    return {
      isLate: diffMinutes > 0,
      delayMinutes: diffMinutes
    };
  };

  // Fonction pour formater le temps de retard
  const formatDelay = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
  };

  // Calcul de la semaine affichée (Lundi à Dimanche)
  const startDate = startOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { locale: fr, weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Navigation temporelle
  const handlePrevious = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNext = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // Obtenir les réservations pour un jour et une heure spécifique
  const getReservationsForDayAndHour = (day: Date, hour: number): Reservation[] => {
    return futureReservations.filter(r => {
      try {
        const resDate = new Date(r.date);
        if (!isSameDay(resDate, day)) return false;

        // Extraire l'heure de la réservation (format "HH:MM")
        const [resHour] = r.heure.split(':').map(Number);
        return resHour === hour;
      } catch {
        return false;
      }
    });
  };

  // Formater le numéro de téléphone (masquer partiellement)
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return `${cleaned.slice(0, 2)}•••••${cleaned.slice(-2)}`;
    }
    return phone;
  };


  // Gérer le clic sur une réservation pour l'éditer
  const handleReservationClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-full px-6 py-6">
        {/* Barre de contrôle planning - Version Premium */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 mb-6">
          <div className="flex justify-between items-center">
            {/* Navigation semaine */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevious}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 hover:scale-105"
              >
                <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="text-lg font-bold text-slate-800 min-w-[280px] text-center">
                Semaine du {format(startDate, 'dd', { locale: fr })} au {format(endDate, 'dd MMM yyyy', { locale: fr })}
              </div>
              <button
                onClick={handleNext}
                className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200 hover:scale-105"
              >
                <ChevronRightIcon className="w-5 h-5 text-slate-600" />
              </button>
              <button
                onClick={handleToday}
                className="ml-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 hover:from-indigo-200 hover:to-indigo-300 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow-md hover:scale-105"
              >
                Aujourd'hui
              </button>
            </div>

            {/* Action principale */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-20 rounded-xl blur transition-opacity"></div>
              <PlusIcon className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Nouvelle réservation</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow border border-slate-200 p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mx-6">
            ❌ Erreur lors du chargement des réservations.
          </div>
        )}

        {/* Grille Planning - Version Premium */}
        {!isLoading && !isError && reservations && (
          <div className="overflow-auto relative bg-white rounded-xl shadow-sm" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            <div className="inline-block min-w-full">
              {/* Grille CSS */}
              <div
                className="grid relative"
                style={{
                  gridTemplateColumns: '80px repeat(7, minmax(160px, 1fr))',
                  gap: '0'
                }}
              >
                {/* Header: Cellule vide + Jours */}
                <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-2 py-3 text-center text-xs font-medium text-gray-400">
                  Heure
                </div>
                {days.map((day) => {
                  const isToday = isSameDay(day, new Date());
                  return (
                    <div
                      key={day.toISOString()}
                      className={`sticky top-0 z-20 border-b border-gray-100 px-3 py-3 text-center ${
                        isToday ? 'bg-indigo-50' : 'bg-white'
                      }`}
                    >
                      <div className={`text-sm font-semibold ${isToday ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {format(day, 'EEE dd/MM', { locale: fr })}
                      </div>
                    </div>
                  );
                })}

                {/* Lignes horaires */}
                {HOURS.map((hour) => {
                  const isCurrentHour = currentTime.getHours() === hour && days.some(day => isSameDay(day, new Date()));

                  return (
                  <>
                    {/* Colonne heure */}
                    <div
                      key={`hour-${hour}`}
                      className={`border-b border-gray-100 px-2 py-3 flex items-start justify-center text-xs font-medium ${
                        isCurrentHour 
                          ? 'bg-indigo-50/50 text-indigo-700' 
                          : 'bg-white text-gray-400'
                      }`}
                      style={{ minHeight: '75px' }}
                    >
                      {String(hour).padStart(2, '0')}h
                    </div>

                    {/* Cellules pour chaque jour */}
                    {days.map((day) => {
                      const reservationsAtHour = getReservationsForDayAndHour(day, hour);
                      const isToday = isSameDay(day, new Date());
                      const isCurrentCell = isToday && isCurrentHour;

                      return (
                        <div
                          key={`${day.toISOString()}-${hour}`}
                          className={`relative border-b border-gray-100 p-2 ${
                            isCurrentCell 
                              ? 'bg-indigo-50/30' 
                              : 'bg-white'
                          }`}
                          style={{ minHeight: '75px' }}
                        >
                          {/* Réservations empilées avec scroll si > 3 */}
                          {reservationsAtHour.length > 0 ? (
                            <div
                              className={`space-y-2 ${reservationsAtHour.length > 3 ? 'overflow-y-auto pr-1' : ''}`}
                              style={{ maxHeight: reservationsAtHour.length > 3 ? '71px' : 'none' }}
                            >
                              {reservationsAtHour.map((res) => {
                                // Déterminer le statut et si c'est aujourd'hui
                                const isArrive = res.statut === 'ARRIVE';
                                const resDate = new Date(res.date);
                                const isTodayRes = isSameDay(resDate, new Date());
                                const { isLate, delayMinutes } = getReservationDelay(res);

                                // Logique de couleur du bord gauche :
                                // - Rouge : en retard
                                // - Vert : client arrivé
                                // - Orange : aujourd'hui mais pas encore arrivé (pas en retard)
                                // - Gris : à venir (pas encore le jour J)
                                let borderColor = 'border-l-gray-300'; // Par défaut : à venir
                                if (isLate) {
                                  borderColor = 'border-l-red-500'; // En retard
                                } else if (isArrive) {
                                  borderColor = 'border-l-emerald-500'; // Client arrivé
                                } else if (isTodayRes) {
                                  borderColor = 'border-l-orange-500'; // Aujourd'hui, en attente
                                }

                                return (
                                  <div
                                    key={res.id}
                                    onClick={() => handleReservationClick(res)}
                                    className={`bg-white rounded-xl shadow-sm p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] border-l-4 ${borderColor} border-r border-t border-b border-gray-200`}
                                    style={{ minHeight: '48px' }}
                                  >
                                    {/* Heure d'arrivée */}
                                    <div className="text-xs font-medium text-gray-900 mb-0.5">
                                      {res.heure}
                                    </div>

                                    {/* Nom client + Badge retard */}
                                    <div className="flex items-start justify-between gap-1 mb-1.5">
                                      <div className="text-sm font-semibold text-gray-900 truncate leading-tight flex-1" title={res.nom}>
                                        {res.nom}
                                      </div>
                                      {isLate && (
                                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                          ⚠ {formatDelay(delayMinutes)}
                                        </span>
                                      )}
                                    </div>

                                    {/* Ligne info compacte: Personnes + Téléphone */}
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-1">
                                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                          {res.nbPersonnes}
                                        </span>
                                      </div>

                                      {res.telephone && (
                                        <div className="flex items-center gap-1">
                                          <PhoneIcon className="w-3 h-3 text-gray-400" />
                                          <span className="text-[10px] text-gray-500">
                                            {formatPhone(res.telephone)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                )})}
              </div>
            </div>
          </div>
        )}

        {/* Légende Premium */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-6 justify-center items-center flex-wrap">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span>À venir</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Aujourd'hui - En attente</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>En retard</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span>Client arrivé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && (
        <ReservationFormModal
          reservation={selectedReservation}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedReservation(undefined);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedReservation(undefined);
            mutate();
          }}
        />
      )}
    </div>
  );
}

