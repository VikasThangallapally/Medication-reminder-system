import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <h1 className="font-display text-4xl text-brand-900">404</h1>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist.</p>
        <Link
          to="/dashboard"
          className="mt-5 inline-block rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
