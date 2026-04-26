export const rewriteRepoMarkdownLinks = (markdown: string): string => {
  return markdown.replace(/\]\(([^)]+)\)/g, (full, target: string) => {
    const trimmed = target.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
      return full;
    }
    if (!trimmed.endsWith('.md')) {
      return full;
    }
    const file = trimmed.replace(/^\.\//, '').split('/').pop() ?? trimmed;
    const basename = file.replace(/\.md$/i, '');
    const href = `/app/admin/documentation/${encodeURIComponent(`repo:${basename}`)}`;
    return `](${href})`;
  });
};
