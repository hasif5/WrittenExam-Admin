// Right-side user drawer: view + edit a user's identity, suspend/reactivate,
// reset password, and (for staff) manage roles. Mirrors the Question drawer.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { EditorDrawer } from "@/components/EditorDrawer";
import { HEROES } from "@/assets/heroes";
import {
  useResetUserPassword,
  useSetUserActive,
  useUpdateUser,
  useUser,
} from "@/api/queries/users";
import { useAuth } from "@/auth/useAuth";
import { confirmAction } from "@/lib/confirm";
import { notifyError, notifySuccess } from "@/lib/notify";
import { UserRolesSection } from "./UserRolesSection";

interface UserEditorDrawerProps {
  opened: boolean;
  userId: string | null;
  onClose: () => void;
}

export function UserEditorDrawer({ opened, userId, onClose }: UserEditorDrawerProps) {
  const { can } = useAuth();
  const canManage = can("users.manage");
  const canManageRoles = can("users.manage_roles");

  const detail = useUser(opened ? userId : null);
  const data = detail.data;
  const isStaff = Boolean(data?.is_staff);

  const updateUser = useUpdateUser();
  const setActive = useSetUserActive();
  const resetPassword = useResetUserPassword();

  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!data) return;
    setFullName(data.full_name ?? "");
    setContact((isStaff ? data.email : data.phone) ?? "");
    setVerified(isStaff ? data.email_verified : data.phone_verified);
    setNewPassword("");
  }, [data?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!userId) return;
    try {
      await updateUser.mutateAsync({
        userId,
        body: {
          full_name: fullName,
          ...(isStaff
            ? { email: contact, email_verified: verified }
            : { phone: contact, phone_verified: verified }),
        },
      });
      notifySuccess("User updated.");
    } catch (err) {
      notifyError(err, "Update failed");
    }
  };

  const toggleActive = () => {
    if (!userId || !data) return;
    const next = !data.is_active;
    confirmAction({
      title: next ? "Reactivate user" : "Suspend user",
      danger: !next,
      children: next
        ? "Re-enable login for this account?"
        : "Suspend this account? Their active sessions are revoked immediately.",
      confirmLabel: next ? "Reactivate" : "Suspend",
      onConfirm: async () => {
        try {
          await setActive.mutateAsync({ userId, active: next });
          notifySuccess(next ? "User reactivated." : "User suspended.");
        } catch (err) {
          notifyError(err, "Action failed");
        }
      },
    });
  };

  const doResetPassword = () => {
    if (!userId) return;
    confirmAction({
      title: "Reset password",
      danger: true,
      children:
        "Set a new password for this user? All their active sessions will be revoked.",
      confirmLabel: "Reset password",
      onConfirm: async () => {
        try {
          await resetPassword.mutateAsync({ userId, newPassword });
          notifySuccess("Password reset.");
          setNewPassword("");
        } catch (err) {
          notifyError(err, "Reset failed");
        }
      },
    });
  };

  return (
    <EditorDrawer
      opened={opened}
      onClose={onClose}
      title="User details"
      caption="Profile, access and roles"
      image={HEROES.usersEditor}
    >
      {detail.isLoading || !data ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : (
        <Stack>
          <Group gap="xs">
            <Badge color={data.is_active ? "green" : "gray"} variant="light">
              {data.is_active ? "Active" : "Suspended"}
            </Badge>
            {isStaff && (
              <Badge color="blue" variant="light">
                {data.staff_type === "super_admin" ? "Super admin" : "Staff"}
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed">
            {data.phone ?? data.email ?? data.id}
          </Text>

          {data.deletion_status && (
            <Alert color="orange" icon={<IconAlertTriangle size={16} />}>
              This account has a pending deletion request ({data.deletion_status}). Manage
              it from the Deletion Queue.
            </Alert>
          )}

          <Divider label="Profile" labelPosition="left" />
          <TextInput
            label="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.currentTarget.value)}
            disabled={!canManage}
          />
          <TextInput
            label={isStaff ? "Email" : "Phone"}
            value={contact}
            onChange={(e) => setContact(e.currentTarget.value)}
            disabled={!canManage}
          />
          <Switch
            label={isStaff ? "Email verified" : "Phone verified"}
            checked={verified}
            onChange={(e) => setVerified(e.currentTarget.checked)}
            disabled={!canManage}
          />
          {canManage && (
            <Group justify="flex-end">
              <Button onClick={save} loading={updateUser.isPending}>
                Save changes
              </Button>
            </Group>
          )}

          {canManage && (
            <>
              <Divider label="Account" labelPosition="left" />
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {data.is_active
                    ? "Suspend to block login and revoke sessions."
                    : "Reactivate to restore login."}
                </Text>
                <Button
                  variant="light"
                  color={data.is_active ? "red" : "green"}
                  onClick={toggleActive}
                  loading={setActive.isPending}
                >
                  {data.is_active ? "Suspend" : "Reactivate"}
                </Button>
              </Group>

              <Divider label="Reset password" labelPosition="left" />
              <PasswordInput
                label="New password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
              />
              <Group justify="flex-end">
                <Button
                  variant="light"
                  color="orange"
                  onClick={doResetPassword}
                  loading={resetPassword.isPending}
                  disabled={newPassword.length < 8}
                >
                  Reset password
                </Button>
              </Group>
            </>
          )}

          {isStaff && canManageRoles && (
            <>
              <Divider label="Roles" labelPosition="left" />
              <UserRolesSection userId={data.id} />
            </>
          )}

          {!canManage && (
            <Text size="xs" c="dimmed">
              You have read-only access to this user.
            </Text>
          )}
        </Stack>
      )}
    </EditorDrawer>
  );
}
