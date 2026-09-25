import AppShell from '../../components/AppShell';
import AuthForm from '../../components/AuthForm';

export const metadata = { title: 'Sign in — AI Universe' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-8 lg:px-8">
        <AuthForm mode="login" next={next} />
      </div>
    </AppShell>
  );
}