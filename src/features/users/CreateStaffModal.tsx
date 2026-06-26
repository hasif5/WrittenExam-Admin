// Create-staff modal (admin/finance) -> POST /admin/users/staff.
// Author: Hasif Ahmed (www.hasif.info)

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Group, Modal, PasswordInput, Select, Stack, TextInput } from "@mantine/core";
import { useCreateStaff } from "@/api/queries/users";
import { notifyError, notifySuccess } from "@/lib/notify";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  display_name: z.string().min(1, "Display name is required").max(255),
  staff_type: z.enum(["admin", "finance"]),
  password: z.string().min(8, "At least 8 characters").max(128),
});

type Values = z.infer<typeof schema>;

export function CreateStaffModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const createStaff = useCreateStaff();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", display_name: "", staff_type: "admin", password: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createStaff.mutateAsync(values);
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
                label="Staff type"
                data={[
                  { value: "admin", label: "Admin" },
                  { value: "finance", label: "Finance" },
                ]}
                value={field.value}
                onChange={(v) => field.onChange(v ?? "admin")}
                error={errors.staff_type?.message}
                allowDeselect={false}
              />
            )}
          />
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
