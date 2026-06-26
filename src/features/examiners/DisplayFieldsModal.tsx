// Edit admin-curated examiner display fields -> PATCH /admin/examiners/{id}/display-fields.
// Author: Hasif Ahmed (www.hasif.info)

import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, TagsInput, TextInput } from "@mantine/core";
import { useEditDisplayFields } from "@/api/queries/examiners";
import { notifyError, notifySuccess } from "@/lib/notify";
import type { ExaminerRosterOut } from "@/api/types";

export function DisplayFieldsModal({
  examiner,
  onClose,
}: {
  examiner: ExaminerRosterOut | null;
  onClose: () => void;
}) {
  const mutation = useEditDisplayFields();
  const [displayedName, setDisplayedName] = useState("");
  const [presentJob, setPresentJob] = useState("");
  const [previousJob, setPreviousJob] = useState("");
  const [university, setUniversity] = useState("");
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (examiner) {
      setDisplayedName(examiner.displayed_name ?? "");
      setPresentJob(examiner.present_job ?? "");
      setPreviousJob("");
      setUniversity(examiner.university ?? "");
      setBadges(
        Array.isArray(examiner.verification_badges)
          ? (examiner.verification_badges as string[])
          : [],
      );
    }
  }, [examiner]);

  if (!examiner) return null;

  const submit = async () => {
    try {
      await mutation.mutateAsync({
        userId: examiner.user_id,
        body: {
          displayed_name: displayedName || null,
          present_job: presentJob || null,
          previous_job: previousJob || null,
          university: university || null,
          verification_badges: badges,
        },
      });
      notifySuccess("Display fields updated.");
      onClose();
    } catch (err) {
      notifyError(err, "Update failed");
    }
  };

  return (
    <Modal opened={Boolean(examiner)} onClose={onClose} title="Edit display fields" centered>
      <Stack>
        <TextInput
          label="Displayed name"
          value={displayedName}
          onChange={(e) => setDisplayedName(e.currentTarget.value)}
        />
        <TextInput
          label="Present job"
          value={presentJob}
          onChange={(e) => setPresentJob(e.currentTarget.value)}
        />
        <TextInput
          label="Previous job"
          value={previousJob}
          onChange={(e) => setPreviousJob(e.currentTarget.value)}
        />
        <TextInput
          label="University"
          value={university}
          onChange={(e) => setUniversity(e.currentTarget.value)}
        />
        <TagsInput
          label="Verification badges"
          placeholder="Type and press Enter"
          value={badges}
          onChange={setBadges}
        />
        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={mutation.isPending} onClick={submit}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
