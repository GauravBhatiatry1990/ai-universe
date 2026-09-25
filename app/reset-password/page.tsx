import AppShell from '../../components/AppShell';
import ResetPasswordForm from '../../components/ResetPasswordForm';

export const metadata = { title: 'Reset password — AI Universe' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-8 lg:px-8">
        <ResetPasswordForm tokenHash={token_hash} type={type} />
      </div>
    </AppShell>
  );
}