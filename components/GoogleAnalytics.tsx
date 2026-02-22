'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const COOKIE_CONSENT_KEY = 'cookie-consent';
export const COOKIE_CONSENT_ACCEPTED_EVENT = 'cookie-consent-accepted';

export default function GoogleAnalytics() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    setShouldLoad(consent === 'accept');

    const onAccept = () => setShouldLoad(true);
    window.addEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccept);
    return () => window.removeEventListener(COOKIE_CONSENT_ACCEPTED_EVENT, onAccept);
  }, []);

  if (!GA_MEASUREMENT_ID || !shouldLoad) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
