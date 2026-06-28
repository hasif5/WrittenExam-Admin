// Staff login (email + password): split-screen branded hero + a focused sign-in
// card. Hero collapses on small screens; the form keeps its own brand lockup so
// the page stays branded everywhere.
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
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconChecks } from "@tabler/icons-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import { errorMessage } from "@/lib/errors";
import { BrandMark } from "@/components/BrandMark";
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

const HIGHLIGHTS = ["Examiner roster", "Question bank", "Taxonomy"];

function BrandPanel() {
  return (
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
            "linear-gradient(155deg, rgba(28,32,86,0.55) 0%, rgba(24,18,64,0.62) 55%, rgba(12,10,38,0.82) 100%)",
        }}
      />
      <Group
        style={{ position: "absolute", top: 36, left: 40, right: 40 }}
        justify="flex-start"
      >
        <ThemeIcon
          size={38}
          radius="md"
          variant="gradient"
          gradient={{ from: "brand.4", to: "brand.7", deg: 135 }}
        >
          <IconChecks size={22} stroke={1.8} />
        </ThemeIcon>
        <Text fw={700} c="white" fz="lg">
          Written Evaluation
        </Text>
      </Group>

      <Stack
        gap="md"
        style={{ position: "absolute", left: 40, right: 40, bottom: 44, color: "#fff" }}
      >
        <Title order={1} c="white" fw={700} style={{ fontSize: 34, lineHeight: 1.15, maxWidth: 460 }}>
          Run written-exam evaluation from one console.
        </Title>
        <Text fz="md" style={{ color: "rgba(255,255,255,0.82)", maxWidth: 460 }}>
          Curate examiners, manage the question bank and taxonomy, and keep applications
          moving - all in one place.
        </Text>
        <Group gap="xs" mt={4}>
          {HIGHLIGHTS.map((label) => (
            <Text
              key={label}
              fz="xs"
              fw={500}
              c="white"
              px="sm"
              py={4}
              style={{
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.18)",
                backdropFilter: "blur(2px)",
              }}
            >
              {label}
            </Text>
          ))}
        </Group>
      </Stack>
    </Box>
  );
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
      <BrandPanel />

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
        <Stack w={400} maw="92vw" gap="xl">
          <Group justify="space-between" align="center">
            <BrandMark />
            <ThemeSwitcher />
          </Group>

          <Stack gap={4}>
            <Title order={2} fw={700}>
              Welcome back
            </Title>
            <Text c="dimmed" size="sm">
              Sign in to continue to the admin console.
            </Text>
          </Stack>

          <form onSubmit={onSubmit} noValidate>
            <Stack gap="md">
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
                    size="md"
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
                    size="md"
                    error={errors.password?.message}
                  />
                )}
              />

              <Button type="submit" fullWidth mt="xs" size="md" loading={isSubmitting}>
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </Box>
  );
}
