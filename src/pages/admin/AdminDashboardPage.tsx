import { CalendarClock, Inbox, Mail, Sparkles, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { DashboardAppTraffic } from '@/components/admin/dashboard/DashboardAppTraffic';
import { DashboardActionQueue } from '@/components/admin/dashboard/DashboardActionQueue';
import { DashboardInboxPreview } from '@/components/admin/dashboard/DashboardInboxPreview';
import { DashboardPipeline } from '@/components/admin/dashboard/DashboardPipeline';
import { DashboardQuickActions } from '@/components/admin/dashboard/DashboardQuickActions';
import { DashboardRecentLeads } from '@/components/admin/dashboard/DashboardRecentLeads';
import { DashboardStatCard } from '@/components/admin/dashboard/DashboardStatCard';
import { DashboardWorkspaceLinks } from '@/components/admin/dashboard/DashboardWorkspaceLinks';
import { AdminPage } from '@/components/admin/AdminPage';
import { useAdminChrome } from '@/hooks/useAdminChrome';
import { fetchDemoAppTrafficSummaries } from '@/lib/appTraffic';
import { fetchLeads, fetchUsers } from '@/lib/adminData';
import {
  computeDashboardLeadStats,
  fetchInboxSnapshot,
  formatOverviewDate,
  getDueFollowUpLeads,
  getRecentLeads,
  greetingForHour,
  type InboxSnapshot,
} from '@/lib/adminDashboard';
import { authErrorMessage } from '@/lib/auth';
import { useAuthStore } from '@/store/useAuthStore';
import type { DemoAppTrafficSummary } from '@/types/appTraffic';
import type { Lead } from '@/types/admin';
import type { UserProfile } from '@/types/rental';

export function AdminDashboardPage() {
  const name = useAuthStore((state) => state.user?.name);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [inbox, setInbox] = useState<InboxSnapshot | null>(null);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [traffic, setTraffic] = useState<DemoAppTrafficSummary[]>([]);
  const [isLoadingTraffic, setIsLoadingTraffic] = useState(true);
  const [error, setError] = useState('');

  const leadStats = useMemo(() => computeDashboardLeadStats(leads), [leads]);
  const dueLeads = useMemo(() => getDueFollowUpLeads(leads), [leads]);
  const recentLeads = useMemo(() => getRecentLeads(leads), [leads]);

  useAdminChrome(
    () => ({
      breadcrumbs: [{ label: 'Overview' }],
      notificationCount: leadStats.dueFollowUps,
    }),
    [leadStats.dueFollowUps],
  );

  useEffect(() => {
    let active = true;

    void Promise.all([fetchUsers(), fetchLeads()])
      .then(([nextUsers, nextLeads]) => {
        if (!active) {
          return;
        }

        setUsers(nextUsers);
        setLeads(nextLeads);
        setIsLoadingLeads(false);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setError(authErrorMessage(loadError));
        setIsLoadingLeads(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    void fetchInboxSnapshot()
      .then((snapshot) => {
        if (active) {
          setInbox(snapshot);
          setIsLoadingInbox(false);
        }
      })
      .catch(() => {
        if (active) {
          setInbox({ recent: [], unreadCount: 0, totalCount: null });
          setIsLoadingInbox(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    void fetchDemoAppTrafficSummaries()
      .then((summaries) => {
        if (active) {
          setTraffic(summaries);
          setIsLoadingTraffic(false);
        }
      })
      .catch(() => {
        if (active) {
          setIsLoadingTraffic(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const greeting = greetingForHour();
  const todayLabel = formatOverviewDate();
  const isLoading = isLoadingLeads;

  return (
    <AdminPage>
      <div className="mx-auto w-full max-w-[88rem] space-y-8">
        <header className="space-y-4">
          <div>
            <p className="text-sm text-ink-muted">{todayLabel}</p>
            <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {name ? `${greeting}, ${name}` : greeting}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
              Your outreach command center — follow-ups, inbox, and lead pipeline in one place.
            </p>
          </div>

          {!isLoading ? <DashboardQuickActions dueCount={leadStats.dueFollowUps} /> : null}
        </header>

        {isLoading ? (
          <p className="text-sm text-ink-muted">Loading overview…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
              <DashboardStatCard
                label="Due follow-ups"
                value={leadStats.dueFollowUps}
                hint="Reach out today"
                to="/admin/leads?followUp=due"
                tone={leadStats.dueFollowUps > 0 ? 'danger' : 'default'}
                icon={CalendarClock}
              />
              <DashboardStatCard
                label="New leads"
                value={leadStats.newCount}
                hint="Not yet contacted"
                to="/admin/leads"
                tone={leadStats.newCount > 0 ? 'accent' : 'default'}
                icon={Sparkles}
              />
              <DashboardStatCard
                label="Unassigned"
                value={leadStats.unassigned}
                hint="Active leads without owner"
                to="/admin/leads"
                icon={UserPlus}
              />
              <DashboardStatCard
                label="This week"
                value={leadStats.thisWeek}
                hint="Leads added in 7 days"
                to="/admin/leads"
                icon={Inbox}
              />
              <DashboardStatCard
                label="Inbox"
                value={inbox?.totalCount ?? inbox?.recent.length ?? 0}
                hint={
                  inbox && inbox.unreadCount > 0
                    ? `${inbox.unreadCount} unread in recent`
                    : 'Synced messages'
                }
                to="/admin/email"
                tone={inbox && inbox.unreadCount > 0 ? 'accent' : 'default'}
                icon={Mail}
              />
              <DashboardStatCard
                label="Users"
                value={users.length}
                hint={`${users.filter((user) => user.role === 'admin').length} admins`}
                to="/admin/users"
                icon={Users}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
              <DashboardActionQueue leads={dueLeads} />
              <DashboardInboxPreview snapshot={inbox} isLoading={isLoadingInbox} />
            </div>

            <DashboardPipeline stats={leadStats} />

            {isLoadingTraffic ? (
              <p className="text-sm text-ink-muted">Loading demo traffic…</p>
            ) : (
              <DashboardAppTraffic summaries={traffic} />
            )}

            <DashboardRecentLeads leads={recentLeads} />

            <DashboardWorkspaceLinks />
          </>
        )}

        {error ? <p className="text-sm text-danger">{error}</p> : null}
      </div>
    </AdminPage>
  );
}
