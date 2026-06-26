// Route table: public login + protected app shell.
// Author: Hasif Ahmed (www.hasif.info)

import { createBrowserRouter, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/auth/ProtectedRoute";
import { LoginPage } from "@/auth/LoginPage";
import { AppShell } from "@/layout/AppShell";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { UsersPage } from "@/features/users/UsersPage";
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
      { path: "users", element: <UsersPage /> },
      { path: "users/deletion-queue", element: <DeletionQueuePage /> },
      { path: "examiner-applications", element: <ExaminerAppsPage /> },
      { path: "examiners", element: <ExaminersPage /> },
      { path: "taxonomy", element: <TaxonomyPage /> },
      { path: "questions", element: <QuestionBankPage /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
