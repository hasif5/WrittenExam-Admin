// Route guard: renders children only when the operator holds the given permission;
// otherwise shows a clear access-denied panel (no broken 403 walls).
// Author: Hasif Ahmed (www.hasif.info)

import { Alert } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useAuth } from "./useAuth";

export function RequirePermission({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { can } = useAuth();
  if (!can(permission)) {
    return (
      <Alert
        color="gray"
        variant="light"
        icon={<IconLock size={18} />}
        title="Access restricted"
      >
        You do not have permission to view this section. Ask a super-admin to grant
        access if you need it.
      </Alert>
    );
  }
  return <>{children}</>;
}
