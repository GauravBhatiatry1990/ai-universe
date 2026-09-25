import { redirect } from 'next/navigation';
import AppShell from '../../components/AppShell';
import AccountContent from '../../components/AccountContent';
import { getCurrentUser } from '../../lib/supabase/auth';
import { getFavorites } from '../../lib/favorites';
import { getMyReviews } from '../../lib/reviews';
import { getProfile } from '../../lib/profile';

export const metadata = { title: 'My account — AI Universe' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');

  const [favorites, reviews, profile] = await Promise.all([
    getFavorites(user.id),
    getMyReviews(user.id),
    getProfile(user.id),
  ]);

  return (
    <AppShell>
      <AccountContent
        userId={user.id}
        email={user.email ?? ''}
        displayName={profile.display_name}
        favorites={favorites}
        reviews={reviews}
      />
    </AppShell>
  );
}