// TODO(phase-2): rewire env access through Hydrogen loader context
// (`context.env`) instead of process.env.
const env = () => ({
  SHIPSTATION_API_KEY: process.env.SHIPSTATION_API_KEY,
  SHIPSTATION_API_SECRET: process.env.SHIPSTATION_API_SECRET,
});
const integrations = () => ({
  shipstation: Boolean(process.env.SHIPSTATION_API_KEY && process.env.SHIPSTATION_API_SECRET),
});

/**
 * ShipStation. Quote-only, never books a real shipment from this
 * scaffold. With keys absent, returns a "not-configured" result so the
 * UI can fall back to a flat-rate display.
 */

export type ShippingQuote = {
  carrierCode: string;
  serviceName: string;
  price: number;
  estimatedDays?: number;
};

export type QuoteResult =
  | { status: "ok"; quotes: ShippingQuote[] }
  | { status: "not-configured" }
  | { status: "error"; message: string };

export async function getShippingQuotes(input: {
  toPostalCode: string;
  toCountry: string;
  weightOz: number;
}): Promise<QuoteResult> {
  if (!integrations().shipstation) return { status: "not-configured" };
  const e = env();
  const auth = Buffer.from(`${e.SHIPSTATION_API_KEY}:${e.SHIPSTATION_API_SECRET}`).toString("base64");

  try {
    const res = await fetch("https://ssapi.shipstation.com/shipments/getrates", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carrierCode: "stamps_com",
        fromPostalCode: "84601",
        toState: "",
        toCountry: input.toCountry,
        toPostalCode: input.toPostalCode,
        weight: { value: input.weightOz, units: "ounces" },
        confirmation: "delivery",
        residential: true,
      }),
    });
    if (!res.ok) return { status: "error", message: `ShipStation ${res.status}` };
    const json = (await res.json()) as Array<{
      carrierCode: string;
      serviceName: string;
      shipmentCost: number;
      otherCost: number;
    }>;
    return {
      status: "ok",
      quotes: json.map((q) => ({
        carrierCode: q.carrierCode,
        serviceName: q.serviceName,
        price: q.shipmentCost + q.otherCost,
      })),
    };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "ShipStation error" };
  }
}
