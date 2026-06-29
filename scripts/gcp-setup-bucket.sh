#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${1:-}"
PREFIX="${2:-}"
ENVIRONMENT="${3:-}"

BUCKET_NAME="$PREFIX-$ENVIRONMENT"
SERVICE_ACCOUNT_NAME="$PREFIX-documents-$ENVIRONMENT"

gcloud auth login
gcloud config set project "$PROJECT_ID"
gcloud storage buckets create "gs://$BUCKET_NAME" --default-storage-class=STANDARD --location=EUROPE-WEST1 --uniform-bucket-level-access --public-access-prevention
gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" --display-name="Service account to access documents on $ENVIRONMENT."

# Wait for bucket to be created
sleep 10

gcloud storage buckets add-iam-policy-binding "gs://$BUCKET_NAME" --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" --role="roles/storage.objectAdmin"
gcloud iam service-accounts keys create "./$SERVICE_ACCOUNT_NAME.credentials.json" --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"