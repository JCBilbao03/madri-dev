import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CleaningLayout } from '@/components/cleaning/CleaningLayout';
import { AuthListener } from '@/components/rental/AuthListener';
import { GuestOnly } from '@/components/rental/GuestOnly';
import { RentalLayout } from '@/components/rental/RentalNavbar';
import { RequireAuth } from '@/components/rental/RequireAuth';
import { useThemeSync } from '@/hooks/useThemeSync';
import { AccountPage } from '@/pages/AccountPage';
import { CleanerProfilePage } from '@/pages/CleanerProfilePage';
import { CleaningDashboardPage } from '@/pages/CleaningDashboardPage';
import { CleaningSearchPage } from '@/pages/CleaningSearchPage';
import { LandingPage } from '@/pages/LandingPage';
import { LandlordDashboard } from '@/pages/LandlordDashboard';
import { ListingQuestionsPage } from '@/pages/ListingQuestionsPage';
import { LoginPage } from '@/pages/LoginPage';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { PropertyDetailPage } from '@/pages/PropertyDetailPage';
import { SavedListingsPage } from '@/pages/SavedListingsPage';
import { SignupPage } from '@/pages/SignupPage';
import { TenantFeed } from '@/pages/TenantFeed';

export function App() {
  useThemeSync();

  return (
    <BrowserRouter>
      <AuthListener />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnly>
              <SignupPage />
            </GuestOnly>
          }
        />
        <Route path="/cleaning-app" element={<CleaningLayout />}>
          <Route index element={<CleaningSearchPage />} />
          <Route path="cleaner/:id" element={<CleanerProfilePage />} />
          <Route path="dashboard" element={<CleaningDashboardPage />} />
        </Route>
        <Route element={<RentalLayout />}>
          <Route
            path="/landlord"
            element={
              <RequireAuth role="landlord">
                <LandlordDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/landlord/listings/:propertyId/questions"
            element={
              <RequireAuth role="landlord">
                <ListingQuestionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tenant"
            element={
              <RequireAuth role="tenant">
                <TenantFeed />
              </RequireAuth>
            }
          />
          <Route
            path="/tenant/saved"
            element={
              <RequireAuth role="tenant">
                <SavedListingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tenant/applications"
            element={
              <RequireAuth role="tenant">
                <MyApplicationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/properties/:propertyId"
            element={
              <RequireAuth>
                <PropertyDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <AccountPage />
              </RequireAuth>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
