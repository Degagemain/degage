---
title: Object storage
roles:
  - technical
---

# Object storage

Documents are stored in a private Google Cloud Storage (GCS) bucket. Each `Document` database row maps 1:1 to a single GCS object.

## Configuration

All object-storage environment variables use the `GCP_BUCKET_` prefix:

| Variable                            | Purpose                                              |
| ----------------------------------- | ---------------------------------------------------- |
| `GCP_BUCKET_NAME`                   | GCS bucket name                                      |
| `GCP_BUCKET_CREDENTIALS`            | Base64-encoded service account JSON (local dev / CI) |
| `GCP_BUCKET_SIGNED_URL_TTL_SECONDS` | Signed view URL lifetime in seconds (default `3600`) |

On GCP runtime (Cloud Run, GCE), omit `GCP_BUCKET_CREDENTIALS` and use Application Default Credentials or workload identity.

### One-time GCP bucket setup

[`scripts/gcp-setup-bucket.sh`](../../scripts/gcp-setup-bucket.sh) provisions a private documents bucket and a dedicated service account.
Requires the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`) and permission to create buckets and service accounts in
the target project.

```bash
pnpm gcp:setup-bucket <PROJECT_ID> <PREFIX> <ENVIRONMENT>
```

| Argument      | Example          | Result                            |
| ------------- | ---------------- | --------------------------------- |
| `PROJECT_ID`  | `my-gcp-project` | GCP project used for all commands |
| `PREFIX`      | `degage`         | Naming prefix for resources       |
| `ENVIRONMENT` | `development`    | Environment suffix                |

The script:

1. Runs `gcloud auth login` and sets the active project
2. Creates bucket `gs://<PREFIX>-<ENVIRONMENT>` in `EUROPE-WEST1` (standard class, uniform bucket-level access, public access prevention)
3. Creates service account `<PREFIX>-documents-<ENVIRONMENT>`
4. Grants that account `roles/storage.objectAdmin` on the bucket
5. Writes a key file `./<PREFIX>-documents-<ENVIRONMENT>.credentials.json` in the repo root (gitignored via `*.credentials.json`)

Set `GCP_BUCKET_NAME` to `<PREFIX>-<ENVIRONMENT>`, then encode the key file (see below). Do not commit the `.credentials.json` file.

### Encoding credentials for `.env`

```bash
pnpm gcp:encode-credentials ./path/to/service-account.json
```

Copy the printed base64 string into `GCP_BUCKET_CREDENTIALS`.

The service account needs bucket access (for example `roles/storage.objectAdmin` on the bucket, or a narrower custom role with
`storage.objects.create`, `storage.objects.delete`, and `storage.objects.get`).

## Object key layout

```
{documentType}/{documentId}/{sanitizedFileName}
```

Examples:

- `registrationCertificate/550e8400-e29b-41d4-a716-446655440000/front.jpg`
- `other/550e8400-e29b-41d4-a716-446655440001/invoice.pdf`

`documentType` matches the `DocumentType` enum (`registrationCertificate`, `other`).

## Signed view URLs

`dbDocumentGetSignedViewUrl(documentId)` returns a temporary HTTPS URL for reading a private object. URLs expire after
`GCP_BUCKET_SIGNED_URL_TTL_SECONDS`.

## Car onboarding registration certificates

Upload via authenticated multipart endpoints:

- `PUT /api/car-onboardings/{id}/registration-certificate/front`
- `PUT /api/car-onboardings/{id}/registration-certificate/back`

Request body: `multipart/form-data` with a `file` field (JPEG or PNG). Max size is set by `NEXT_PUBLIC_MAX_UPLOAD_FILE_SIZE_MB` (default `4.5`
MB, aligned with Vercel request limits).

First upload creates a `Document` row, uploads to GCS, and links the FK on the car onboarding. Re-upload updates the same document in place
(stable id, FK unchanged).
