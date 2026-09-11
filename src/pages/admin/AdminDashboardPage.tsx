import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { LeadTable } from '@/components/admin/LeadTable';
import { StatCard } from '@/components/rental/StatCard';
import { Container } from '@/components/ui/Container';
import { fetchLeads, fetchUsers } from '@/lib/adminData';
import { authErrorMessage } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { Lead } from '@/types/admin';
import type { UserProfile } from '@/types/rental';

export function AdminDashboardPage() {
  const name = useAuthStore((state) => state.user?.name);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    void Promise.all([fetchUsers(), fetchLeads()])
      .then(([nextUsers, nextLeads]) => {
        if (!active) {
          return;
        }

        setUsers(nextUsers);
        setLeads(nextLeads);
        setIsLoading(false);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(authErrorMessage(loadError));
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const userStats = useMemo(
    () => ({
      total: users.length,
      tenant: users.filter((user) => user.role === 'tenant').length,
      landlord: users.filter((user) => user.role === 'landlord').length,
      admin: users.filter((user) => user.role === 'admin').length,
    }),
    [users],
  );

  const leadStats = useMemo(
    () => ({
      total: leads.length,
      marketing: leads.filter((lead) => lead.appId === 'marketing').length,
      rental: leads.filter((lead) => lead.appId === 'rental').length,
      cleaning: leads.filter((lead) => lead.appId === 'cleaning').length,
    }),
    [leads],
  );

  const recentLeads = useMemo(() => leads.slice(0, 5), [leads]);
  const admins = useMemo(() => users.filter((user) => user.role === 'admin'), [users]);

  return (
    <main id="main" className="min-h-svh bg-base pt-36 pb-24 lg:pt-28 lg:pb-16">
      <Container className="max-w-[88rem]">
        <p className="text-sm font-medium text-accent-soft">Admin</p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {name ? `Welcome, ${name}` : 'Overview'}
        </h1>
        <p className="mt-3 max-w-xl text-ink-muted">
          Monitor users and leads across the MadriBuild site, rental marketplace, and cleaning app.
        </p>

        {isLoading ? (
          <p className="mt-10 text-sm text-ink-muted">Loading overview…</p>
        ) : (
          <>
            <div className="mt-8 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">Users</h2>
              <Link to="/admin/users" className="text-sm font-medium text-accent-soft hover:text-ink">
                View users
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total" value={userStats.total} />
              <StatCard label="Tenants" value={userStats.tenant} />
              <StatCard label="Landlords" value={userStats.landlord} />
              <StatCard label="Admins" value={userStats.admin} />
            </div>

            <div className="mt-12 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">Leads</h2>
              <Link to="/admin/leads" className="text-sm font-medium text-accent-soft hover:text-ink">
                View leads
              </Link>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total" value={leadStats.total} />
              <StatCard label="MadriBuild site" value={leadStats.marketing} />
              <StatCard label="Rental" value={leadStats.rental} />
              <StatCard label="Cleaning" value={leadStats.cleaning} />
            </div>

            <h2 className="mt-12 font-display text-lg font-semibold text-ink sm:text-xl">Recent leads</h2>
            {recentLeads.length === 0 ? (
              <p className="mt-5 rounded-2xl border border-dashed border-line bg-surface p-10 text-center text-sm text-ink-muted">
                No leads yet.
              </p>
            ) : (
              <div className="mt-5">
                <LeadTable
                  leads={recentLeads}
                  admins={admins}
                  emptyLabel="No leads yet."
                />
              </div>
            )}
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          </>
        )}
      </Container>
    </main>
  );
}
