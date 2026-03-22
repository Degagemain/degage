'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import { DocumentationMarkdown } from '@/app/components/documentation/documentation-markdown';
import type { DocumentationViewerPayload } from '@/actions/documentation/get-by-external-id-for-viewer';

type Props = {
  doc: DocumentationViewerPayload;
};

export function DocViewBody({ doc }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/app');
    }
  };

  return (
    <main className="bg-muted/30 min-h-[calc(100dvh-4rem)] py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-4 gap-2" type="button" onClick={handleBack}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{doc.title}</h1>
        </div>
        {doc.format === 'markdown' ? (
          <DocumentationMarkdown markdown={doc.content} />
        ) : (
          <pre className="text-muted-foreground font-sans text-sm leading-relaxed whitespace-pre-wrap">{doc.content}</pre>
        )}
      </div>
    </main>
  );
}
