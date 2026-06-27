// Route table: public login + protected app shell.
// Author: Hasif Ahmed (www.hasif.info)

import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { RequirePermission } from "@/auth/RequirePermission";
import { LoginPage } from "@/auth/LoginPage";
import { AppShell } from "@/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { UsersPage } from "@/features/users/UsersPage";
import { RolesPage } from "@/features/roles/RolesPage";
import { DeletionQueuePage } from "@/features/deletion-queue/DeletionQueuePage";
import { ExaminerAppsPage } from "@/features/examiner-apps/ExaminerAppsPage";
import { ExaminersPage } from "@/features/examiners/ExaminersPage";
import { TaxonomyPage } from "@/features/taxonomy/TaxonomyPage";
import { QuestionBankPage } from "@/features/question-bank/QuestionBankPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: "users",
        element: (
          <RequirePermission permission="users.read">
            <UsersPage />
          </RequirePermission>
        ),
      },
      {
        path: "roles",
        element: (
          <RequirePermission permission="rbac.manage">
            <RolesPage />
          </RequirePermission>
        ),
      },
      {
        path: "users/deletion-queue",
        element: (
          <RequirePermission permission="deletion_queue.review">
            <DeletionQueuePage />
          </RequirePermission>
        ),
      },
      {
        path: "examiner-applications",
        element: (
          <RequirePermission permission="examiner_apps.review">
            <ExaminerAppsPage />
          </RequirePermission>
        ),
      },
      {
        path: "examiners",
        element: (
          <RequirePermission permission="examiners.manage">
            <ExaminersPage />
          </RequirePermission>
        ),
      },
      {
        path: "taxonomy",
        element: (
          <RequirePermission permission="taxonomy.read">
            <TaxonomyPage />
          </RequirePermission>
        ),
      },
      {
        path: "questions",
        element: (
          <RequirePermission permission="question_bank.read">
            <QuestionBankPage />
          </RequirePermission>
        ),
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
