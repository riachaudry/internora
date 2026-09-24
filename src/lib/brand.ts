/** Single source of truth for every piece of official Internora information. */
export const BRAND = {
  name: 'Internora',
  legalName: 'INTERNORA',
  tagline: 'Virtual Internships. Real Experience.',
  description: 'Project-Based Virtual Internships & Career Experience',
  hr: { name: 'Rahat Chaudhry', whatsapp: '+966 54 786 0296', whatsappLink: 'https://wa.me/966547860296' },
  payment: {
    accountName: 'Rahat Chaudhry',
    number: '03041713438',
    methods: [
      { id: 'jazzcash', label: 'JazzCash' },
      { id: 'easypaisa', label: 'Easypaisa' },
    ] as const,
  },
} as const;

export const TRUST_STATEMENTS = [
  'This is a project-based virtual internship program.',
  'Performance rewards are subject to eligibility and final evaluation.',
  'Certificates are issued after meeting the published completion criteria.',
  'LORs are issued according to performance and eligibility.',
] as const;

export type Duration = 4 | 6 | 8;

export const PLANS: Record<Duration, {
  duration: Duration; fee: number; label: string;
  rewards: { position: 1 | 2 | 3; amount: number; lor: boolean; label: string }[];
}> = {
  4: {
    duration: 4, fee: 700, label: '4 Weeks',
    rewards: [
      { position: 1, amount: 1000, lor: true, label: 'PKR 1,000 + LOR' },
      { position: 2, amount: 700, lor: true, label: 'PKR 700 + LOR' },
      { position: 3, amount: 0, lor: true, label: 'LOR only' },
    ],
  },
  6: {
    duration: 6, fee: 1000, label: '6 Weeks',
    rewards: [
      { position: 1, amount: 1500, lor: true, label: 'PKR 1,500 + LOR' },
      { position: 2, amount: 1000, lor: true, label: 'PKR 1,000 + LOR' },
      { position: 3, amount: 0, lor: true, label: 'LOR only' },
    ],
  },
  8: {
    duration: 8, fee: 1500, label: '8 Weeks',
    rewards: [
      { position: 1, amount: 3000, lor: true, label: 'PKR 3,000 + LOR' },
      { position: 2, amount: 2000, lor: true, label: 'PKR 2,000 + LOR' },
      { position: 3, amount: 0, lor: true, label: 'LOR only' },
    ],
  },
};

export const DURATIONS: Duration[] = [4, 6, 8];
export const isDuration = (v: unknown): v is Duration => v === 4 || v === 6 || v === 8;
export const feeFor = (d: Duration) => PLANS[d].fee;
export const formatPKR = (n: number) => `PKR ${n.toLocaleString('en-PK')}`;

/** Weights used for the final score. Weekly work 70%, final project 30%. */
export const SCORE_WEIGHTS = { weekly: 0.7, finalProject: 0.3 } as const;

/** A week counts as complete once this share of required task points is approved. */
export const WEEK_COMPLETION_THRESHOLD = 0.7;
