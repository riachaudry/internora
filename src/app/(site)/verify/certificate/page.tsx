import { redirect } from 'next/navigation';
import { Card, Button } from '@/components/ui';

export const metadata = { title: 'Verify a certificate' };

export default function CertificateSearchPage({ searchParams }: { searchParams: { id?: string } }) {
  if (searchParams.id) redirect(`/verify/certificate/${encodeURIComponent(searchParams.id.trim())}`);
  return (
    <div className="wrap py-16">
      <h1 className="font-display text-3xl font-extrabold">Verify a certificate</h1>
      <Card className="mt-6 max-w-lg p-7">
        <form className="flex gap-2">
          <input name="id" placeholder="INT-CERT-2026-000001" className="field font-mono" aria-label="Certificate ID" />
          <Button type="submit">Verify</Button>
        </form>
      </Card>
    </div>
  );
}
