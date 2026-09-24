import Link from 'next/link';
import { LoginForm } from './LoginForm';

export const metadata = { title: 'Sign in' };

export default function LoginPage({ searchParams }: { searchParams: { next?: string; message?: string } }) {
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-[15px] text-slate">
        New here? <Link href="/register" className="font-semibold text-signal hover:underline">Create an account</Link>
      </p>
      <LoginForm next={searchParams.next} message={searchParams.message} />
    </>
  );
}
