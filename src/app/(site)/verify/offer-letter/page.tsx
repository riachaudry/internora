import { redirect } from 'next/navigation';
import { Card, Button } from '@/components/ui';

export const metadata = { title: 'Verify an offer letter' };

export default function OfferSearchPage({ searchParams }: { searchParams: { id?: string } }) {
  if (searchParams.id) redirect(`/verify/offer-letter/${encodeURIComponent(searchParams.id.trim())}`);
  return (
    <div className="wrap py-16">
      <h1 className="font-display text-3xl font-extrabold">Verify an offer letter</h1>
      <Card className="mt-6 max-w-lg p-7">
        <form className="flex gap-2">
          <input name="id" placeholder="INT-OL-2026-000001" className="field font-mono" aria-label="Offer letter ID" />
          <Button type="submit">Verify</Button>
        </form>
      </Card>
    </div>
  );
}
