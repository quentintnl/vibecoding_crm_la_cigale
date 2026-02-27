/**
 * Page d'accueil - Redirige vers la vue Liste
 */

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/liste');
}
