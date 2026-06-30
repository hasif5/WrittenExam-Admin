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
import { useAppearance } from "@/app/appearance";
import type { Appearance } from "@/app/theme";
import loginHeroDark from "@/assets/login-hero-dark.webp";
import loginHeroLight from "@/assets/login-hero-light.webp";
import loginHeroColorful from "@/assets/login-hero-colorful.webp";

// One blended hero per appearance so the brand panel matches the active theme.
const LOGIN_HERO: Record<Appearance, string> = {
  light: loginHeroLight,
  dark: loginHeroDark,
  colorful: loginHeroColorful,
};

// Scrim + foreground tuned per hero: dark heroes carry white text over a dark
// scrim; the airy light hero needs dark text over a soft light scrim to stay legible.
interface PanelStyle {
  scrim: string;
  fg: string;
  sub: string;
  pillBg: string;
  pillBorder: string;
}

const PANEL: Record<Appearance, PanelStyle> = {
  dark: {
    scrim:
      "linear-gradient(155deg, rgba(28,32,86,0.45) 0%, rgba(24,18,64,0.55) 55%, rgba(12,10,38,0.80) 100%)",
    fg: "#ffffff",
    sub: "rgba(255,255,255,0.82)",
    pillBg: "rgba(255,255,255,0.14)",
    pillBorder: "rgba(255,255,255,0.20)",
  },
  colorful: {
    scrim:
      "linear-gradient(160deg, rgba(18,12,40,0.20) 0%, rgba(18,12,40,0.28) 55%, rgba(10,8,28,0.60) 100%)",
    fg: "#ffffff",
    sub: "rgba(255,255,255,0.90)",
    pillBg: "rgba(255,255,255,0.18)",
    pillBorder: "rgba(255,255,255,0.30)",
  },
  light: {
    // Dark text over the airy hero, so the scrim LIGHTENS the lower band (where
    // the headline/subtitle/pills sit) to lift it off the busy paper art, then
    // fades out by mid-panel so the upper imagery stays visible.
    scrim:
      "linear-gradient(to top, rgba(248,249,253,0.95) 0%, rgba(248,249,253,0.85) 18%, rgba(248,249,253,0.45) 34%, rgba(248,249,253,0) 56%)",
    fg: "#1e2547",
    sub: "rgba(30,37,71,0.78)",
    pillBg: "rgba(255,255,255,0.65)",
    pillBorder: "rgba(49,74,156,0.22)",
  },
};

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname?: string };
}

const HIGHLIGHTS = ["Examiner roster", "Question bank", "Taxonomy"];

function BrandPanel({ appearance }: { appearance: Appearance }) {
  const cfg = PANEL[appearance];
  return (
    <Box
      visibleFrom="md"
      style={{
        position: "relative",
        flex: "1 1 0",
        backgroundImage: `url(${LOGIN_HERO[appearance]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box style={{ position: "absolute", inset: 0, background: cfg.scrim }} />
      {/* Right-edge blend: fade the hero into the form panel's background so the
          split has no hard vertical seam. Uses the same token as the form side so
          it matches in every scheme. */}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(to right, transparent 62%, var(--login-hero-blend, var(--login-form-bg, var(--mantine-color-body))) 100%)",
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
        <Text fw={700} fz="lg" style={{ color: cfg.fg }}>
          Written Evaluation
        </Text>
      </Group>

      <Stack gap="md" style={{ position: "absolute", left: 40, right: 40, bottom: 44 }}>
        <Title order={1} fw={700} style={{ fontSize: 34, lineHeight: 1.15, maxWidth: 460, color: cfg.fg }}>
          Run written-exam evaluation from one console.
        </Title>
        <Text fz="md" style={{ color: cfg.sub, maxWidth: 460 }}>
          Curate examiners, manage the question bank and taxonomy, and keep applications
          moving - all in one place.
        </Text>
        <Group gap="xs" mt={4}>
          {HIGHLIGHTS.map((label) => (
            <Text
              key={label}
              fz="xs"
              fw={500}
              px="sm"
              py={4}
              style={{
                color: cfg.fg,
                borderRadius: 999,
                background: cfg.pillBg,
                border: `1px solid ${cfg.pillBorder}`,
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
  const { appearance } = useAppearance();
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
      <BrandPanel appearance={appearance} />

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
