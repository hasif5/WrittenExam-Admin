// Examiner application detail drawer: full info + photo preview + decision actions.
// Decisions require remarks (server enforces min length 1).
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  Center,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconCheck, IconEdit, IconX } from "@tabler/icons-react";
import { AssetImage } from "@/components/AssetImage";
import { ErrorState } from "@/components/ErrorState";
import { useApplicationDecision, useExaminerApp } from "@/api/queries/examiners";
import { notifyError, notifySuccess } from "@/lib/notify";
import { formatDateTime } from "@/lib/format";

function statusColor(status: string): string {
  switch (status) {
    case "approved":
      return "green";
    case "rejected":
      return "red";
    case "changes_requested":
      return "orange";
    default:
      return "yellow";
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="sm">{value || "-"}</Text>
    </div>
  );
}

export function ApplicationDrawer({
  applicationId,
  onClose,
}: {
  applicationId: string | null;
  onClose: () => void;
}) {
  const query = useExaminerApp(applicationId);
  const decision = useApplicationDecision();
  const [remarks, setRemarks] = useState("");
  const [remarksError, setRemarksError] = useState<string | null>(null);

  useEffect(() => {
    setRemarks("");
    setRemarksError(null);
  }, [applicationId]);

  const app = query.data;
  const isDecided = app?.status === "approved" || app?.status === "rejected";

  const decide = async (action: "approve" | "reject" | "request-changes") => {
    if (remarks.trim().length === 0) {
      setRemarksError("Remarks are required to record a decision.");
      return;
    }
    try {
      await decision.mutateAsync({ id: app!.id, decision: action, remarks: remarks.trim() });
      notifySuccess(`Application ${action.replace("-", " ")}d.`);
      onClose();
    } catch (err) {
      notifyError(err, "Decision failed");
    }
  };

  return (
    <Drawer
      opened={Boolean(applicationId)}
      onClose={onClose}
      position="right"
      size="lg"
      title={<Title order={4}>Examiner application</Title>}
    >
      {query.isLoading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : app ? (
        <Stack>
          <Group justify="space-between">
            <Title order={4}>{app.name}</Title>
            <Badge color={statusColor(app.status)} variant="light" size="lg">
              {app.status}
            </Badge>
          </Group>

          <AssetImage assetId={app.photo_asset_id} alt="applicant photo" height={220} />

          <Group grow>
            <Field label="Email" value={app.email} />
            <Field label="Phone" value={app.phone} />
          </Group>
          <Group grow>
            <Field label="Present job" value={app.present_job} />
            <Field label="Previous job" value={app.previous_job} />
          </Group>
          <Field label="University" value={app.university} />
          <Group grow>
            <Field label="Declaration accepted" value={app.declaration_accepted ? "Yes" : "No"} />
            <Field label="Applied" value={formatDateTime(app.created_at)} />
          </Group>
          {app.reviewed_at && <Field label="Reviewed" value={formatDateTime(app.reviewed_at)} />}
          {app.remarks && <Field label="Last remarks" value={app.remarks} />}

          {isDecided ? (
            <Text c="dimmed" size="sm" mt="md">
              This application has been {app.status}. No further decision is available.
            </Text>
          ) : (
            <>
              <Divider label="Decision" labelPosition="left" mt="sm" />
              <Textarea
                label="Remarks"
                placeholder="Required - explain the decision (visible in the audit log)."
                minRows={3}
                autosize
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.currentTarget.value);
                  if (remarksError) setRemarksError(null);
                }}
                error={remarksError}
              />
              <Group justify="flex-end">
                <Button
                  variant="light"
                  color="orange"
                  leftSection={<IconEdit size={16} />}
                  loading={decision.isPending}
                  onClick={() => decide("request-changes")}
                >
                  Request changes
                </Button>
                <Button
                  variant="light"
                  color="red"
                  leftSection={<IconX size={16} />}
                  loading={decision.isPending}
                  onClick={() => decide("reject")}
                >
                  Reject
                </Button>
                <Button
                  color="green"
                  leftSection={<IconCheck size={16} />}
                  loading={decision.isPending}
                  onClick={() => decide("approve")}
                >
                  Approve
                </Button>
              </Group>
            </>
          )}
        </Stack>
      ) : null}
    </Drawer>
  );
}
