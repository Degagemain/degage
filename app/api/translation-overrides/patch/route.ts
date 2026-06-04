import { generateTranslationOverridePatch } from '@/actions/translation-override/generate-patch';
import { withAdmin } from '@/api/with-context';

export const GET = withAdmin(async () => {
  const patch = await generateTranslationOverridePatch();
  return new Response(patch, {
    headers: {
      'Content-Type': 'text/x-patch; charset=utf-8',
      'Content-Disposition': 'attachment; filename="translation-overrides.patch"',
    },
  });
});
