/**
 * Vue Liste - Tableau des réservations
 * US-01, US-02, US-03, US-04, US-05
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useReservations, deleteReservation, updateReservationStatus } from '@/hooks/useReservations';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, UserIcon, MagnifyingGlassIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Reservation } from '@/types/reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationFormModal from '@/components/ReservationFormModal';

export default function ListePage() {
  const { reservations, isLoading, isError, mutate } = useReservations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPastReservations, setShowPastReservations] = useState(false);

  // Mettre à jour l'heure actuelle chaque minute pour recalculer les retards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Chaque minute
    return () => clearInterval(interval);
  }, []);

  // Filtrer les réservations pour ne montrer que celles d'aujourd'hui et futures
  const today = format(new Date(), 'yyyy-MM-dd');

  // Fonction pour calculer le retard d'une réservation
  const getReservationDelay = (reservation: Reservation): { isLate: boolean; delayMinutes: number } => {
    // Seulement pour les réservations d'aujourd'hui
    if (reservation.date !== today) {
      return { isLate: false, delayMinutes: 0 };
    }

    // Seulement pour les réservations "À venir"
    if (reservation.statut === 'ARRIVE') {
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

  // Appliquer la recherche et le filtrage
  const filteredReservations = useMemo(() => {
    if (!reservations) return [];

    // Filtrer par date selon le toggle
    let filtered = showPastReservations
      ? reservations
      : reservations.filter(r => r.date >= today);

    // Appliquer la recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.nom.toLowerCase().includes(query) ||
        r.telephone?.toLowerCase().includes(query) ||
        r.notes?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [reservations, today, searchQuery, showPastReservations]);

  // Grouper les réservations par date
  const reservationsByDate = useMemo(() => {
    const grouped = new Map<string, Reservation[]>();

    filteredReservations.forEach(reservation => {
      if (!grouped.has(reservation.date)) {
        grouped.set(reservation.date, []);
      }
      grouped.get(reservation.date)!.push(reservation);
    });

    // Trier les réservations de chaque jour par heure
    grouped.forEach(reservations => {
      reservations.sort((a, b) => a.heure.localeCompare(b.heure));
    });

    // Séparer les dates futures/aujourd'hui et les dates passées
    const entries = Array.from(grouped.entries());
    const futureEntries = entries.filter(([date]) => date >= today).sort((a, b) => a[0].localeCompare(b[0]));
    const pastEntries = entries.filter(([date]) => date < today).sort((a, b) => b[0].localeCompare(a[0]));

    // Retourner futures en premier, puis passées
    return [...futureEntries, ...pastEntries];
  }, [filteredReservations, today]);

  // Handler pour la suppression
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteReservation(id);
      mutate(); // Revalider les données
    } catch (error) {
      alert('Erreur lors de la suppression');
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  // Handler pour marquer présent/absent
  const handleTogglePresence = async (reservation: Reservation) => {
    try {
      const newStatut = reservation.statut !== 'ARRIVE';
      await updateReservationStatus(reservation.id, newStatut);
      mutate(); // Revalider les données
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(error);
    }
  };

  // Handler pour ouvrir le modal d'édition
  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setIsModalOpen(true);
  };

  // Handler pour ouvrir le modal de création
  const handleCreate = () => {
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  // Handler après succès de création/édition
  const handleSuccess = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
    mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
              Réservations
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              {filteredReservations.length > 0
                ? `${filteredReservations.length} réservation(s) trouvée(s)`
                : 'Chargement...'}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-20 rounded-xl blur transition-opacity"></div>
            <PlusIcon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Nouvelle réservation</span>
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, téléphone ou notes..."
              className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg leading-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all sm:text-sm shadow-sm"
            />
          </div>

          {/* Toggle pour afficher les anciennes réservations */}
          <button
            onClick={() => setShowPastReservations(!showPastReservations)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              showPastReservations
                ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            <CalendarDaysIcon className="w-5 h-5" />
            <span>{showPastReservations ? 'Masquer les anciennes réservations' : 'Afficher les anciennes réservations'}</span>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && <SkeletonTable rows={5} />}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            ❌ Erreur lors du chargement des réservations. Vérifiez votre configuration Airtable.
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredReservations.length === 0 && (
          <div className="bg-white rounded-lg shadow border border-slate-200 p-12 text-center">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery.trim() ? 'Aucune réservation trouvée' : showPastReservations ? 'Aucune réservation' : 'Aucune réservation à venir'}
            </h3>
            <p className="text-slate-500 mb-4">
              {searchQuery.trim()
                ? 'Essayez de modifier votre recherche.'
                : showPastReservations
                ? 'Commencez par créer votre première réservation.'
                : 'Commencez par créer votre première réservation.'}
            </p>
            {!searchQuery.trim() && (
              <Button onClick={handleCreate}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Créer une réservation
              </Button>
            )}
          </div>
        )}

        {/* Liste groupée par date */}
        {!isLoading && !isError && reservationsByDate.length > 0 && (
          <div className="space-y-6">
            {reservationsByDate.map(([date, dayReservations]) => {
              const isToday = date === today;
              const isPast = date < today;
              return (
                <div key={date} className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  isToday 
                    ? 'border-l-4 border-emerald-500' 
                    : isPast 
                    ? 'border-l-4 border-slate-200 opacity-75' 
                    : 'border-l-4 border-slate-300'
                }`}>
                  {/* En-tête de la date */}
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className={`text-lg font-semibold ${isPast ? 'text-slate-500' : 'text-slate-900'}`}>
                          {format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {dayReservations.length} réservation{dayReservations.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {isToday && (
                        <span className="bg-emerald-500/10 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                          Aujourd'hui
                        </span>
                      )}
                      {isPast && (
                        <span className="bg-slate-500/10 text-slate-600 text-xs font-medium px-3 py-1 rounded-full">
                          Passé
                        </span>
                      )}
                    </div>
                  </div>

                {/* Cartes des réservations du jour */}
                <div>
                  {dayReservations.map((reservation, index) => {
                    const { isLate, delayMinutes } = getReservationDelay(reservation);

                    return (
                    <div
                      key={reservation.id}
                      className={`p-4 hover:bg-slate-50 transition-colors duration-200 ${
                        index !== dayReservations.length - 1 ? 'border-b border-slate-100' : ''
                      } ${isLate ? 'bg-red-50/30' : ''}`}
                    >
                      <div className="grid grid-cols-[80px_120px_150px_130px_1fr_70px_120px] items-center gap-4">
                        {/* Heure */}
                        <div className="text-lg font-semibold text-slate-900">
                          {reservation.heure}
                        </div>

                        {/* Statut arrivé, à venir ou en retard */}
                        <div className="flex justify-start">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            reservation.statut === 'ARRIVE' 
                              ? 'bg-emerald-500/10 text-emerald-700' 
                              : isLate
                              ? 'bg-red-500/10 text-red-700'
                              : 'bg-amber-500/10 text-amber-700'
                          }`}>
                            {reservation.statut === 'ARRIVE'
                              ? '✓ Arrivé'
                              : isLate
                              ? `⚠ Retard ${formatDelay(delayMinutes)}`
                              : 'À venir'}
                          </span>
                        </div>

                        {/* Nom */}
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {reservation.nom}
                          </h3>
                        </div>

                        {/* Téléphone */}
                        <div className="text-sm text-slate-500">
                          {reservation.telephone || '-'}
                        </div>

                        {/* Notes/Commentaire */}
                        <div className="text-sm text-slate-400 truncate" title={reservation.notes || ''}>
                          {reservation.notes || '-'}
                        </div>

                        {/* Nombre de personnes */}
                        <div className="flex items-center justify-center gap-1.5 text-sm text-slate-600">
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{reservation.nbPersonnes}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleTogglePresence(reservation)}
                            className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title={reservation.statut === 'ARRIVE' ? 'Marquer absent' : 'Marquer présent'}
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(reservation)}
                            className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(reservation.id)}
                            disabled={deletingId === reservation.id}
                            className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && (
        <ReservationFormModal
          reservation={editingReservation}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReservation(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

