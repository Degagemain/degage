#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-}"
PREFIX="${2:-}"
ENVIRONMENT="${3:-}"

if [[ -z "$PROJECT_ID" || -z "$PREFIX" || -z "$ENVIRONMENT" ]]; then
  echo "Usage: $0 <PROJECT_ID> <PREFIX> <ENVIRONMENT>" >&2
  echo "Example: $0 my-gcp-project degage development" >&2
  exit 1
fi

SERVICE_ACCOUNT_NAME="$PREFIX-sheets-$ENVIRONMENT"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
CREDENTIALS_FILE="./$SERVICE_ACCOUNT_NAME.credentials.json"

gcloud auth login
gcloud config set project "$PROJECT_ID"

gcloud services enable sheets.googleapis.com

gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
  --display-name="Service account for Google Sheets on $ENVIRONMENT." \
  || echo "Service account may already exist; continuing."

gcloud iam service-accounts keys create "$CREDENTIALS_FILE" \
  --iam-account="$SERVICE_ACCOUNT_EMAIL"

echo
echo "Created key file: $CREDENTIALS_FILE (gitignored via *.credentials.json)"
echo
echo "Next steps:"
echo "  1. Share the target Google Spreadsheet with this email as Editor:"
echo "       $SERVICE_ACCOUNT_EMAIL"
echo "  2. Encode credentials for .env:"
echo "       pnpm gcp:encode-credentials $CREDENTIALS_FILE"
echo "  3. Set GOOGLE_SHEETS_CREDENTIALS to the printed base64 string"
echo "  4. Set GOOGLE_SHEETS_CAR_ONBOARDING_SPREADSHEET_ID to the spreadsheet id"
echo "  5. Optionally set GOOGLE_SHEETS_CAR_ONBOARDING_SHEET_NAME to a tab name (defaults to the first tab)"
