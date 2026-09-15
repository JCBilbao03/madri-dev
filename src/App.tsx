import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { CleaningLayout } from '@/components/cleaning/CleaningLayout';
import { InventoryLayout } from '@/components/inventory/InventoryLayout';
import { AuthListener } from '@/components/rental/AuthListener';
import { GuestOnly } from '@/components/rental/GuestOnly';
import { RentalLayout } from '@/components/rental/RentalNavbar';
import { RentalRoleGate } from '@/components/rental/RentalRoleGate';
import { RequireAuth } from '@/components/rental/RequireAuth';
import { useThemeSync } from '@/hooks/useThemeSync';
import { AccountPage } from '@/pages/AccountPage';
import { AdminAppsPage } from '@/pages/admin/AdminAppsPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminLeadsPage } from '@/pages/admin/AdminLeadsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { CleanerProfilePage } from '@/pages/CleanerProfilePage';
import { CleaningDashboardPage } from '@/pages/CleaningDashboardPage';
import { CleaningSearchPage } from '@/pages/CleaningSearchPage';
import { InventoryCatalogPage } from '@/pages/InventoryCatalogPage';
import { InventoryFormPage } from '@/pages/InventoryFormPage';
import { InventoryItemPage } from '@/pages/InventoryItemPage';
import { InventoryLabelsPage } from '@/pages/InventoryLabelsPage';
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
        <Route
          element={
            <RequireAuth role="admin">
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/leads" element={<AdminLeadsPage />} />
          <Route path="/admin/apps" element={<AdminAppsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route path="/cleaning-app" element={<CleaningLayout />}>
          <Route index element={<CleaningSearchPage />} />
          <Route path="cleaner/:id" element={<CleanerProfilePage />} />
          <Route path="dashboard" element={<CleaningDashboardPage />} />
        </Route>
        <Route path="/inventory-app" element={<InventoryLayout />}>
          <Route index element={<InventoryCatalogPage />} />
          <Route path="items/new" element={<InventoryFormPage />} />
          <Route path="items/:itemId" element={<InventoryItemPage />} />
          <Route path="items/:itemId/edit" element={<InventoryFormPage />} />
          <Route path="labels" element={<InventoryLabelsPage />} />
        </Route>
        <Route element={<RentalLayout />}>
          <Route
            path="/landlord"
            element={
              <RentalRoleGate allow="landlord">
                <LandlordDashboard />
              </RentalRoleGate>
            }
          />
          <Route
            path="/landlord/listings/:propertyId/questions"
            element={
              <RentalRoleGate allow="landlord">
                <ListingQuestionsPage />
              </RentalRoleGate>
            }
          />
          <Route
            path="/tenant"
            element={
              <RentalRoleGate allow="tenant">
                <TenantFeed />
              </RentalRoleGate>
            }
          />
          <Route
            path="/tenant/saved"
            element={
              <RentalRoleGate allow="tenant">
                <SavedListingsPage />
              </RentalRoleGate>
            }
          />
          <Route
            path="/tenant/applications"
            element={
              <RentalRoleGate allow="tenant">
                <MyApplicationsPage />
              </RentalRoleGate>
            }
          />
          <Route
            path="/properties/:propertyId"
            element={
              <RentalRoleGate allow="any">
                <PropertyDetailPage />
              </RentalRoleGate>
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
