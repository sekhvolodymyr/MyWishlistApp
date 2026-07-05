const USER_AGENT =
  "Mozilla/5.0 (compatible; OnlineWishListBot/1.0; +https://onlinewishlist.app)";

function decodeEntities(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getMeta(html, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(
        `<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']+)["'][^>]*>`,
        "i",
      ),
      new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${name}["'][^>]*>`,
        "i",
      ),
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeEntities(match[1]);
    }
  }

  return "";
}

function getTitle(html) {
  return (
    getMeta(html, ["og:title", "twitter:title", "product:title"]) ||
    decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || "")
  );
}

function getPrice(html) {
  const metaPrice = getMeta(html, [
    "product:price:amount",
    "og:price:amount",
    "twitter:data1",
  ]);

  if (metaPrice) return metaPrice;

  const jsonLdPrice = html.match(/"price"\s*:\s*"?([0-9]+(?:[.,][0-9]{1,2})?)"?/i)?.[1];
  const visiblePrice = html.match(/(?:[$€£]\s?[0-9]+(?:[.,][0-9]{1,2})?)/)?.[0];
  return jsonLdPrice || visiblePrice || "";
}

function absoluteUrl(value, sourceUrl) {
  if (!value) return "";
  try {
    return new URL(value, sourceUrl).toString();
  } catch {
    return "";
  }
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const { url } = request.body || {};

  let sourceUrl;
  try {
    sourceUrl = new URL(url);
    if (!["http:", "https:"].includes(sourceUrl.protocol)) {
      throw new Error("Unsupported protocol");
    }
  } catch {
    return response.status(400).json({ error: "Enter a valid product URL." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const pageResponse = await fetch(sourceUrl.toString(), {
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!pageResponse.ok) {
      return response.status(422).json({
        error: `Store returned ${pageResponse.status}. Add product details manually.`,
      });
    }

    const html = await pageResponse.text();
    const image = absoluteUrl(
      getMeta(html, ["og:image", "twitter:image", "image"]),
      sourceUrl.toString(),
    );

    return response.status(200).json({
      title: getTitle(html) || `Wishlist find from ${sourceUrl.hostname}`,
      source_url: sourceUrl.toString(),
      store_name: sourceUrl.hostname.replace(/^www\./, ""),
      price: getPrice(html),
      image_url: image,
      note: "Imported from product page metadata. Review before sharing.",
    });
  } catch (error) {
    return response.status(422).json({
      error:
        error.name === "AbortError"
          ? "Store took too long to respond. Add product details manually."
          : "Could not import this store page. Add product details manually.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
