import { Card, SectionHead, Button } from '@/components/ui';

export const metadata = { title: 'Verify a document' };

export default function VerifyIndexPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="Public verification"
        title="Check an Internora document"
        body="Every certificate and offer letter carries an ID. Anyone — an employer, a university, a recruiter — can check it here without an account."
      />
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">Certificate</h2>
          <p className="mt-2 text-[15px] text-slate">IDs look like INT-CERT-2026-000001.</p>
          <form action="/verify/certificate" className="mt-5 flex gap-2">
            <input name="id" placeholder="INT-CERT-2026-000001" className="field font-mono" aria-label="Certificate ID" />
            <Button type="submit">Verify</Button>
          </form>
        </Card>
        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">Offer letter</h2>
          <p className="mt-2 text-[15px] text-slate">IDs look like INT-OL-2026-000001.</p>
          <form action="/verify/offer-letter" className="mt-5 flex gap-2">
            <input name="id" placeholder="INT-OL-2026-000001" className="field font-mono" aria-label="Offer letter ID" />
            <Button type="submit">Verify</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
