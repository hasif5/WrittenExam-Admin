// Staff login page (email + password) with a two-panel branded layout.
// Author: Hasif Ahmed (www.hasif.info)

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  Box,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { errorMessage } from "@/lib/errors";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import loginHero from "@/assets/login-hero.webp";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (status === "authenticated") {
    const from = (location.state as LocationState | null)?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await login(values.email, values.password);
      const from = (location.state as LocationState | null)?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setSubmitError(errorMessage(err));
    }
  });

  return (
    <Box style={{ display: "flex", minHeight: "100vh" }}>
      {/* Brand panel (hidden on small screens). */}
      <Box
        visibleFrom="md"
        style={{
          position: "relative",
          flex: "1 1 0",
          backgroundImage: `url(${loginHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(40,46,110,0.30) 0%, rgba(40,30,90,0.55) 100%)",
          }}
        />
        <Stack
          gap={6}
          style={{ position: "absolute", left: 40, bottom: 40, right: 40, color: "#fff" }}
        >
          <Title order={2} c="white">
            Engineer&apos;s Written Evaluation Platform
          </Title>
          <Text size="sm" style={{ color: "rgba(255,255,255,0.85)" }}>
            Curate examiners, taxonomy, and the question bank from one console.
          </Text>
        </Stack>
      </Box>

      {/* Form panel. */}
      <Box
        style={{
          flex: "1 1 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--mantine-spacing-xl)",
          backgroundColor: "var(--login-form-bg, var(--mantine-color-body))",
        }}
      >
        <Box w={400} maw="92vw">
          <Group justify="space-between" align="flex-start" mb="lg">
            <Stack gap={2}>
              <Title order={2}>Admin Panel</Title>
              <Text c="dimmed" size="sm">
                Sign in to continue
              </Text>
            </Stack>
            <ThemeSwitcher />
          </Group>

          <Paper withBorder shadow="sm" p="xl" radius="md">
            <form onSubmit={onSubmit} noValidate>
              <Stack>
                {submitError && (
                  <Alert
                    icon={<IconAlertCircle size={16} />}
                    color="red"
                    variant="light"
                    title="Sign-in failed"
                  >
                    {submitError}
                  </Alert>
                )}

                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      label="Email"
                      placeholder="staff@example.com"
                      autoComplete="username"
                      error={errors.email?.message}
                      data-autofocus
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <PasswordInput
                      {...field}
                      label="Password"
                      placeholder="Your password"
                      autoComplete="current-password"
                      error={errors.password?.message}
                    />
                  )}
                />

                <Button type="submit" fullWidth mt="sm" loading={isSubmitting}>
                  Sign in
                </Button>
              </Stack>
            </form>
          </Paper>

          <Text c="dimmed" size="xs" ta="center" mt="md">
            Staff access only (admin / finance).
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
