// Hero banner image registry - one cohesive 1K Nano Banana illustration per
// admin surface, in matching dark + light variants, optimized to webp. Add a
// new page hero by dropping its two webp files here and adding one entry.
// Author: Hasif Ahmed (www.hasif.info)

import dashboardDark from "./dashboard-dark.webp";
import dashboardLight from "./dashboard-light.webp";
import deletionDark from "./deletion-dark.webp";
import deletionLight from "./deletion-light.webp";
import examinerAppsDark from "./examiner-apps-dark.webp";
import examinerAppsLight from "./examiner-apps-light.webp";
import examinerAppsEditorDark from "./examiner-apps-editor-dark.webp";
import examinerAppsEditorLight from "./examiner-apps-editor-light.webp";
import examinersDark from "./examiners-dark.webp";
import examinersLight from "./examiners-light.webp";
import questionsDark from "./questions-dark.webp";
import questionsLight from "./questions-light.webp";
import questionsEditorDark from "./questions-editor-dark.webp";
import questionsEditorLight from "./questions-editor-light.webp";
import roleEditorDark from "./role-editor-dark.webp";
import roleEditorLight from "./role-editor-light.webp";
import rolesDark from "./roles-dark.webp";
import rolesLight from "./roles-light.webp";
import usersEditorDark from "./users-editor-dark.webp";
import usersEditorLight from "./users-editor-light.webp";
import taxonomyDark from "./taxonomy-dark.webp";
import taxonomyLight from "./taxonomy-light.webp";
import usersDark from "./users-dark.webp";
import usersLight from "./users-light.webp";

/** A page hero in both colour-scheme variants. */
export interface HeroVariants {
  dark: string;
  light: string;
}

export const HEROES = {
  dashboard: { dark: dashboardDark, light: dashboardLight },
  users: { dark: usersDark, light: usersLight },
  examinerApps: { dark: examinerAppsDark, light: examinerAppsLight },
  examiners: { dark: examinersDark, light: examinersLight },
  taxonomy: { dark: taxonomyDark, light: taxonomyLight },
  questions: { dark: questionsDark, light: questionsLight },
  roles: { dark: rolesDark, light: rolesLight },
  deletion: { dark: deletionDark, light: deletionLight },
  // Drawer banners (motif right, empty left for the title) - one per surface that
  // has a side drawer. Distinct from the wide full-page heroes above.
  roleEditor: { dark: roleEditorDark, light: roleEditorLight },
  usersEditor: { dark: usersEditorDark, light: usersEditorLight },
  questionsEditor: { dark: questionsEditorDark, light: questionsEditorLight },
  examinerAppsEditor: { dark: examinerAppsEditorDark, light: examinerAppsEditorLight },
} satisfies Record<string, HeroVariants>;
