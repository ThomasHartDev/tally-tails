/**
 * Third-party marketing tags. Loaded inline into the document head so the
 * Pixel can fire on the first paint. Each block is gated on a public env
 * var. When it's empty the block doesn't render.
 */
export function AnalyticsScripts({
  nonce,
  metaPixelId,
  klaviyoPublicKey,
}: {
  nonce?: string;
  metaPixelId?: string;
  klaviyoPublicKey?: string;
}) {
  return (
    <>
      {metaPixelId && (
        <>
          <script
            nonce={nonce}
            dangerouslySetInnerHTML={{
              __html: `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');
              `.trim(),
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {klaviyoPublicKey && (
        <script
          async
          nonce={nonce}
          src={`https://static.klaviyo.com/onsite/js/${klaviyoPublicKey}/klaviyo.js`}
        />
      )}
    </>
  );
}
