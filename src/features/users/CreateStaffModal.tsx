// Create-staff modal -> POST /admin/users/staff. A super-admin gets the locked
// full-access role; a regular staff member gets the selected custom staff role(s).
// Author: Hasif Ahmed (www.hasif.info)

import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Group,
  Modal,
  MultiSelect,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useCreateStaff } from "@/api/queries/users";
import { useRbacRoles } from "@/api/queries/rbac";
import { notifyError, notifySuccess } from "@/lib/notify";

const schema = z
  .object({
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    display_name: z.string().min(1, "Display name is required").max(255),
    staff_type: z.enum(["super_admin", "staff"]),
    role_codes: z.array(z.string()),
    password: z.string().min(8, "At least 8 characters").max(128),
  })
  .refine((v) => v.staff_type === "super_admin" || v.role_codes.length > 0, {
    message: "Select at least one role for a staff member",
    path: ["role_codes"],
  });

type Values = z.infer<typeof schema>;

export function CreateStaffModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const createStaff = useCreateStaff();
  const rolesQuery = useRbacRoles();

  const templateOptions = useMemo(
    () =>
      (rolesQuery.data ?? [])
        .filter((r) => r.is_staff_template && r.is_active)
        .map((r) => ({ value: r.code, label: r.name })),
    [rolesQuery.data],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      display_name: "",
      staff_type: "staff",
      role_codes: [],
      password: "",
    },
  });

  const staffType = watch("staff_type");

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createStaff.mutateAsync({
        email: values.email,
        display_name: values.display_name,
        staff_type: values.staff_type,
        role_codes: values.staff_type === "super_admin" ? [] : values.role_codes,
        password: values.password,
      });
      notifySuccess("Staff account created.");
      close();
    } catch (err) {
      notifyError(err, "Could not create staff");
    }
  });

  return (
    <Modal opened={opened} onClose={close} title="Create staff account" centered>
      <form onSubmit={onSubmit} noValidate>
        <Stack>
          <Controller
            control={control}
            name="display_name"
            render={({ field }) => (
              <TextInput {...field} label="Display name" error={errors.display_name?.message} />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextInput {...field} label="Email" error={errors.email?.message} />
            )}
          />
          <Controller
            control={control}
            name="staff_type"
            render={({ field }) => (
              <Select
                label="Account type"
                data={[
                  { value: "staff", label: "Staff (custom roles)" },
                  { value: "super_admin", label: "Super admin (full access)" },
                ]}
                value={field.value}
                onChange={(v) => field.onChange(v ?? "staff")}
                error={errors.staff_type?.message}
                allowDeselect={false}
              />
            )}
          />
          {staffType === "staff" && (
            <Controller
              control={control}
              name="role_codes"
              render={({ field }) => (
                <MultiSelect
                  label="Roles"
                  placeholder={
                    templateOptions.length ? "Select staff role(s)" : "No staff roles yet"
                  }
                  data={templateOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.role_codes?.message}
                  searchable
                />
              )}
            />
          )}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <PasswordInput {...field} label="Password" error={errors.password?.message} />
            )}
          />
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={createStaff.isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
