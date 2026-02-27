/**
 * Vue Kanban - Visualisation par statut
 * US-06
 */

'use client';

import { useState, useEffect } from 'react';
import { useReservations, updateReservationStatus } from '@/hooks/useReservations';
import { Navigation } from '@/components/Navigation';
import { Badge } from '@/components/ui/Badge';
import { SkeletonKanban } from '@/components/ui/Skeleton';
import { PlusIcon, UserIcon, PhoneIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Reservation } from '@/types/reservation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReservationFormModal from '@/components/ReservationFormModal';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function KanbanPage() {
  const { reservations, isLoading, isError, mutate } = useReservations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configuration des sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Commence le drag après 5px de mouvement (plus réactif)
      },
    })
  );

  // Mettre à jour l'heure actuelle chaque minute pour recalculer les retards
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Chaque minute
    return () => clearInterval(interval);
  }, []);

  // Filtrer les réservations pour ne montrer QUE celles d'aujourd'hui
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayReservations = reservations?.filter(r => r.date === today) || [];

  // Fonction pour calculer le retard d'une réservation
  const getReservationDelay = (reservation: Reservation): { isLate: boolean; delayMinutes: number } => {
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

  // Séparer les réservations par statut
  const reservationsAVenir = todayReservations.filter(r => r.statut === 'A_VENIR');
  const reservationsArrivees = todayReservations.filter(r => r.statut === 'ARRIVE');

  // Handler pour changer de colonne
  const handleMoveCard = async (reservation: Reservation, newStatut: 'A_VENIR' | 'ARRIVE') => {
    try {
      await updateReservationStatus(reservation.id, newStatut === 'ARRIVE');
      mutate();
    } catch (error) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(error);
    }
  };

  // Handler pour le début du drag
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handler pour le survol pendant le drag
  const handleDragOver = (event: DragOverEvent) => {
    // Pas besoin de stocker overId, juste pour le feedback visuel de la colonne
  };

  // Handler pour la fin du drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const reservationId = active.id as string;
    const targetColumn = over.id as string;

    // Si on drop sur une carte, on prend la colonne de cette carte
    let finalTargetColumn = targetColumn;
    if (targetColumn !== 'A_VENIR' && targetColumn !== 'ARRIVE') {
      // C'est une carte, on cherche dans quelle colonne elle est
      const targetReservation = todayReservations.find(r => r.id === targetColumn);
      if (targetReservation) {
        finalTargetColumn = targetReservation.statut;
      } else {
        return;
      }
    }

    // Trouver la réservation
    const reservation = todayReservations.find(r => r.id === reservationId);
    if (!reservation) return;

    // Déterminer le nouveau statut basé sur la colonne cible
    const newStatut: 'A_VENIR' | 'ARRIVE' = finalTargetColumn === 'ARRIVE' ? 'ARRIVE' : 'A_VENIR';

    // Ne rien faire si c'est déjà dans la bonne colonne
    if (reservation.statut === newStatut) return;

    // Mettre à jour le statut
    await handleMoveCard(reservation, newStatut);
  };

  // Formatage de la date du jour pour l'affichage
  const todayFormatted = format(new Date(), 'EEEE d MMMM yyyy', { locale: fr });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
              Vue Kanban
            </h1>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Gestion du flux de service
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-500 opacity-0 group-hover:opacity-20 rounded-xl blur transition-opacity"></div>
            <PlusIcon className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Nouvelle réservation</span>
          </button>
        </div>

        {/* Date du jour */}
        <div className="bg-gradient-to-r from-white to-indigo-50/50 rounded-xl shadow-md border border-slate-200/50 px-6 py-4 mb-6 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {todayFormatted}
            </h2>
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {todayReservations.length} réservation(s)
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && <SkeletonKanban />}

        {/* Error State */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            ❌ Erreur lors du chargement des réservations.
          </div>
        )}

        {/* Kanban Board */}
        {!isLoading && !isError && todayReservations && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Colonne "À venir" */}
              <KanbanColumn
                id="A_VENIR"
                title="À venir"
                count={reservationsAVenir.length}
                reservations={reservationsAVenir}
                variant="info"
                onMove={(res) => handleMoveCard(res, 'ARRIVE')}
                getReservationDelay={getReservationDelay}
                formatDelay={formatDelay}
              />

              {/* Colonne "Arrivé" */}
              <KanbanColumn
                id="ARRIVE"
                title="Arrivé"
                count={reservationsArrivees.length}
                reservations={reservationsArrivees}
                variant="success"
                onMove={(res) => handleMoveCard(res, 'A_VENIR')}
                getReservationDelay={getReservationDelay}
                formatDelay={formatDelay}
              />
            </div>

            {/* Overlay pour la carte en cours de drag */}
            <DragOverlay dropAnimation={{
              duration: 200,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
              {activeId ? (
                <div className="rotate-3 scale-105 shadow-2xl">
                  <KanbanCardContent
                    reservation={todayReservations.find(r => r.id === activeId)!}
                    getReservationDelay={getReservationDelay}
                    formatDelay={formatDelay}
                    isDragging={true}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modal de création */}
      {isModalOpen && (
        <ReservationFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            mutate();
          }}
        />
      )}
    </div>
  );
}

// Composant colonne Kanban
interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  reservations: Reservation[];
  variant: 'info' | 'success';
  onMove: (reservation: Reservation) => void;
  getReservationDelay: (reservation: Reservation) => { isLate: boolean; delayMinutes: number };
  formatDelay: (minutes: number) => string;
}

function KanbanColumn({ id, title, count, reservations, variant, onMove, getReservationDelay, formatDelay }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const bgClass = variant === 'info'
    ? 'bg-blue-50/80 border-blue-200'
    : 'bg-emerald-50/80 border-emerald-200';

  const badgeVariant = variant === 'info' ? 'info' : 'success';

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-5 shadow-md border ${bgClass} transition-all duration-200 ${
        isOver ? 'ring-2 ring-indigo-400 bg-indigo-50/30 scale-[1.02]' : ''
      }`}
    >
      {/* Header de colonne */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          {title}
        </h2>
        <Badge variant={badgeVariant} className="shadow-sm">
          {count}
        </Badge>
      </div>

      {/* Cards */}
      <SortableContext items={reservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 min-h-[200px]">
          {reservations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              Aucune réservation
            </div>
          ) : (
            reservations.map((reservation) => (
              <DraggableKanbanCard
                key={reservation.id}
                reservation={reservation}
                onMove={onMove}
                getReservationDelay={getReservationDelay}
                formatDelay={formatDelay}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// Composant carte Kanban draggable
interface KanbanCardProps {
  reservation: Reservation;
  onMove: (reservation: Reservation) => void;
  getReservationDelay: (reservation: Reservation) => { isLate: boolean; delayMinutes: number };
  formatDelay: (minutes: number) => string;
}

function DraggableKanbanCard({ reservation, onMove, getReservationDelay, formatDelay }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: reservation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCardContent
        reservation={reservation}
        onMove={onMove}
        getReservationDelay={getReservationDelay}
        formatDelay={formatDelay}
        isDragging={isDragging}
      />
    </div>
  );
}

// Contenu de la carte (réutilisable pour le drag overlay)
interface KanbanCardContentProps {
  reservation: Reservation;
  onMove?: (reservation: Reservation) => void;
  getReservationDelay: (reservation: Reservation) => { isLate: boolean; delayMinutes: number };
  formatDelay: (minutes: number) => string;
  isDragging?: boolean;
}

function KanbanCardContent({ reservation, onMove, getReservationDelay, formatDelay, isDragging = false }: KanbanCardContentProps) {
  const [isMoving, setIsMoving] = useState(false);
  const { isLate, delayMinutes } = getReservationDelay(reservation);

  const handleClick = async () => {
    if (isDragging || !onMove) return;

    setIsMoving(true);
    try {
      await onMove(reservation);
    } finally {
      setTimeout(() => setIsMoving(false), 300);
    }
  };

  // Déterminer la couleur de la bordure gauche
  let borderLeftColor = 'border-l-blue-400'; // Par défaut : à venir (bleu)
  if (isLate) {
    borderLeftColor = 'border-l-red-500'; // En retard (rouge)
  } else if (reservation.statut === 'ARRIVE') {
    borderLeftColor = 'border-l-emerald-500'; // Arrivé (vert)
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative bg-white p-4 rounded-xl shadow-md border border-slate-200 border-l-4 ${borderLeftColor} transition-all hover:shadow-xl
        ${!isDragging ? 'cursor-grab active:cursor-grabbing hover:-translate-y-1' : 'cursor-grabbing'}
        ${isMoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
    >

      {/* Contenu */}
      <div className="relative z-10">
        {/* Ligne 1 : Heure + Nom + Personnes + Badge retard */}
        <div className="flex items-center gap-2 mb-3">
          {/* Heure */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <ClockIcon className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-bold text-slate-900">{reservation.heure}</span>
          </div>

          {/* Nom Client */}
          <h3 className="text-base font-bold text-slate-900 truncate flex-1">
            {reservation.nom}
          </h3>

          {/* Badge retard (si en retard) */}
          {isLate && (
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-md flex-shrink-0">
              ⚠ {formatDelay(delayMinutes)}
            </span>
          )}

          {/* Nb Personnes */}
          <Badge variant="neutral" className="flex-shrink-0 shadow-sm">
            <UserIcon className="w-3 h-3 mr-0.5" />
            {reservation.nbPersonnes}
          </Badge>
        </div>

        {/* Ligne 2 : Téléphone + Badge instruction */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Téléphone */}
          {reservation.telephone ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <PhoneIcon className="w-3.5 h-3.5" />
              <span className="font-medium">{reservation.telephone}</span>
            </div>
          ) : (
            <div></div>
          )}

          {/* Badge instruction */}
          <span className={`
            text-xs font-bold flex-shrink-0 px-2 py-1 rounded-md transition-all
            ${reservation.statut === 'A_VENIR' 
              ? isLate
                ? 'text-red-700 bg-red-100 group-hover:bg-red-200'
                : 'text-blue-700 bg-blue-100 group-hover:bg-blue-200'
              : 'text-emerald-700 bg-emerald-100 group-hover:bg-emerald-200'
            }
          `}>
            {reservation.statut === 'A_VENIR' ? '→ Marquer arrivé' : '← Marquer à venir'}
          </span>
        </div>

        {/* Ligne 3 : Notes (si présentes) */}
        {reservation.notes && (
          <p className="text-xs text-slate-600 truncate mt-2 italic" title={reservation.notes}>
            {reservation.notes}
          </p>
        )}
      </div>
    </div>
  );
}

