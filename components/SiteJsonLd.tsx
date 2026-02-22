import JsonLd from "./JsonLd";

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studysession.com";
  return siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
}

export default function SiteJsonLd() {
  const baseUrl = getBaseUrl();

  const webSite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "StudySession",
    url: baseUrl,
    description:
      "AI-powered calendar for students. Organize your syllabus, build a smart study schedule, and take gamified online courses with XP and achievements.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/learn?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StudySession",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "StudySession is an AI-powered learning platform with gamified courses, smart calendar scheduling, and monthly competitions.",
  };

  const softwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "StudySession",
    applicationCategory: "EducationApplication",
    operatingSystem: "Web",
    url: baseUrl,
    description:
      "AI calendar, online courses, syllabus parser, and study schedule maker. Gamified learning with XP, achievements, and monthly races.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return <JsonLd data={[webSite, organization, softwareApplication]} />;
}
