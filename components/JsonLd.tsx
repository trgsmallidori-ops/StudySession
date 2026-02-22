/**
 * Renders JSON-LD structured data for SEO rich snippets.
 * Pass a single schema object or an array of schema objects.
 */
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const jsonLd = Array.isArray(data) ? data : [data];
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
