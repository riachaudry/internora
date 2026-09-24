import { Card, SectionHead, Button, Alert } from '@/components/ui';
import { BRAND } from '@/lib/brand';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="wrap py-16">
      <SectionHead
        eyebrow="Get in touch"
        title="Contact Internora"
        body="WhatsApp is the fastest route for anything before you apply. Once you are enrolled, open a support ticket from your dashboard so your question is attached to your record."
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">HR</h2>
          <p className="mt-3 text-[17px] font-semibold text-ink">{BRAND.hr.name}</p>
          <p className="mt-4 text-[13px] font-semibold text-slate-light">WhatsApp</p>
          <p className="text-[17px] font-semibold text-ink">{BRAND.hr.whatsapp}</p>
          <Button href={BRAND.hr.whatsappLink} className="mt-6 w-full">Open WhatsApp chat</Button>
        </Card>

        <Card className="p-7">
          <h2 className="font-display text-lg font-bold">Already enrolled?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            Open a support ticket from your dashboard. Tickets are linked to your student ID and
            internship, so you do not have to explain your situation from scratch. You can attach a
            screenshot, and you will see every reply in one thread.
          </p>
          <Button href="/dashboard/support" variant="secondary" className="mt-6 w-full">Go to support</Button>
        </Card>
      </div>

      <Alert tone="warn" title="One payment account only">
        <p className="mt-1">
          Internora collects fees at a single JazzCash / Easypaisa account: {BRAND.payment.accountName},
          number {BRAND.payment.number}. If anyone asks you to send money anywhere else, it is not us.
          We never ask for your password, OTP or PIN.
        </p>
      </Alert>
    </div>
  );
}
