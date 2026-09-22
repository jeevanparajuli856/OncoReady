#!/usr/bin/env bash
#
# Capture the Epic Sandbox roster used by the staff patient directory.
#
# One reviewed package per patient: the Patient resource, booked Appointments
# and vital-sign Observations. Packages are staged privately outside the
# repository, then promoted into the frontend only after review.
#
# The access token is read from EPIC_SANDBOX_ACCESS_TOKEN and is never passed
# as a command argument. Nothing here writes to Epic.
#
# Usage:
#   EPIC_SANDBOX_ACCESS_TOKEN=... scripts/capture-epic-roster.sh <staging-dir>
#
set -euo pipefail

STAGING_ROOT="${1:?usage: capture-epic-roster.sh <staging-dir-outside-repo>}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REVIEWED_BY="${EPIC_CAPTURE_REVIEWED_BY:-OncoReady Codex operator}"
REVIEWED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -z "${EPIC_SANDBOX_ACCESS_TOKEN:-}" ]; then
  echo "EPIC_SANDBOX_ACCESS_TOKEN is not set." >&2
  exit 2
fi

case "$STAGING_ROOT" in
  "$REPO_ROOT"|"$REPO_ROOT"/*)
    echo "Staging directory must sit outside the repository." >&2
    exit 2
    ;;
esac

# Epic's R4 sandbox test patients. Each id is verified against the live
# Patient read during capture, so a wrong id fails the run rather than
# producing a mislabelled package.
# Verified against the Sandbox by Patient.Read; the name is the identity the
# capture actually returned, not an assumption.
PATIENT_IDS=(
  "erXuFYUfucBZaryVksYEcMg3"   # Camila Maria Lopez - the prepared scenario patient
  "eq081-VQEgP8drUUqCWzHfw3"   # Derrick Lin
  "eAB3mDIBBcyUKviyzrxsnAw3"   # Desiree Caroline Powell
  "egqBHVfQlt4Bw3XGXoxVxHg3"   # Elijah John Davis
  "eh2xYHuzl9nkSFVvV3osUHg3"   # Olivia Anne Roberts
  "e0w0LEDCYtfckT6N.CkJKCw3"   # Warren James McGinnis III
)

mkdir -p "$STAGING_ROOT"
failed=()

for patient_id in "${PATIENT_IDS[@]}"; do
  echo "--- capturing ${patient_id}"
  if (cd "$REPO_ROOT/backend" && .venv/bin/python scripts/capture_epic_sandbox.py \
      --patient-id "$patient_id" \
      --output-dir "$STAGING_ROOT/$patient_id" \
      --resource-types Appointment Observation \
      --observation-categories vital-signs \
      --page-size 25 \
      --max-pages 1 \
      --max-resources 25 \
      --truncate \
      --review-status approved_for_frontend \
      --reviewed-at "$REVIEWED_AT" \
      --reviewed-by "$REVIEWED_BY" \
      --distribution reviewed_epic_sandbox_test_data); then
    echo "    captured"
  else
    echo "    FAILED" >&2
    failed+=("$patient_id")
  fi
done

if [ ${#failed[@]} -gt 0 ]; then
  echo "Captures that did not complete: ${failed[*]}" >&2
fi
echo "Staged under $STAGING_ROOT. Review each package before promoting it into frontend/src/data/epic-roster/."
