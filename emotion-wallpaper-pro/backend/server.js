import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  const geminiReady = !!(GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here");
  const cfReady = !!(CF_ACCOUNT_ID && CF_API_TOKEN && CF_ACCOUNT_ID !== "your_cloudflare_account_id");
  res.json({ status: geminiReady && cfReady ? "ok" : "missing_keys", gemini: geminiReady, huggingface: cfReady });
});

const SIZE_MAP = {
  desktop: { width: 1024, height: 576 },
  mobile:  { width: 576,  height: 1024 },
  square:  { width: 768,  height: 768 },
};

app.post("/api/generate", async (req, res) => {
  const { emotion, style, intensity, size } = req.body;

  if (!emotion) return res.status(400).json({ error: "Emotion is required." });
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here")
    return res.status(500).json({ error: "Gemini API key missing in .env" });
  if (!CF_ACCOUNT_ID || !CF_API_TOKEN)
    return res.status(500).json({ error: "Cloudflare credentials missing in .env" });

  const dims = SIZE_MAP[size] || SIZE_MAP.desktop;
  console.log(`\n🎨 Generating: "${emotion}" | style "${style}" | size ${size} (${dims.width}x${dims.height})`);

  const intensityLabel =
    intensity < 35 ? "subtle, soft, delicate, muted tones"
    : intensity < 65 ? "balanced, expressive, rich tones"
    : "extremely intense, overwhelming, vivid, saturated, dramatic";

  // Step 1: Gemini art prompt
  const geminiPayload = {
    contents: [{
      parts: [{
        text: `You are an expert AI art director creating wallpapers.

Create an image generation prompt for an abstract wallpaper with EXACTLY these parameters:
- EMOTION: "${emotion}" — the entire image must deeply convey this feeling
- STYLE: "${style}" — the image must be rendered in exactly this artistic style
- INTENSITY: ${intensityLabel}

Requirements:
- 2 sentences maximum
- Describe specific colors that match "${emotion}"
- The "${style}" technique must be clearly visible
- No people, faces, text, or logos
- End with: "stunning 4K wallpaper, no text, masterpiece"

Example for Love + Watercolor:
"Soft watercolor washes of blush pink, deep rose and crimson bloom and bleed across the canvas, forming tender flowing shapes that pulse with warmth and longing. Delicate pigment blooms and translucent overlapping layers create a dreamy, emotionally charged abstract composition. Stunning 4K wallpaper, no text, masterpiece."

Now create one for: ${emotion} + ${style}
Respond with ONLY the prompt.`,
      }],
    }],
  };

  let prompt = "";
  try {
    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiPayload),
    });
    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({ error: err?.error?.message || "Gemini API error." });
    }
    const geminiData = await geminiRes.json();
    prompt = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!prompt) return res.status(500).json({ error: "Gemini returned empty response." });
    console.log(`✓ Prompt: ${prompt.substring(0, 90)}...`);
  } catch (err) {
    return res.status(500).json({ error: `Gemini error: ${err.message}` });
  }

  // Step 2: Cloudflare AI (Flux model) with correct size
  console.log(`⏳ Calling Cloudflare AI (${dims.width}x${dims.height})...`);
  try {
    const cfUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

    const cfRes = await fetch(cfUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        width: dims.width,
        height: dims.height,
        num_steps: 8,
      }),
    });

    if (!cfRes.ok) {
      const errText = await cfRes.text().catch(() => "Unknown error");
      console.log(`   Cloudflare error ${cfRes.status}: ${errText.substring(0, 150)}`);
      return res.status(cfRes.status).json({ error: `Cloudflare error ${cfRes.status}. Check your Account ID and Token.` });
    }

    const jsonData = await cfRes.json();
    const b64 = jsonData?.result?.image;

    if (!b64) {
      console.log(`   Unexpected response: ${JSON.stringify(jsonData).substring(0, 150)}`);
      return res.status(500).json({ error: "Cloudflare returned no image." });
    }

    console.log(`✓ Image generated via Cloudflare AI (Flux)!`);
    return res.json({ prompt, imageUrl: `data:image/jpeg;base64,${b64}` });

  } catch (err) {
    console.error(`✗ Cloudflare error: ${err.message}`);
    return res.status(500).json({ error: `Image generation failed: ${err.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎨 Emotion Wallpaper Backend`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`   Gemini:      ${GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here" ? "✓ Ready" : "✗ Missing"}`);
  console.log(`   Cloudflare:  ${CF_ACCOUNT_ID && CF_API_TOKEN ? "✓ Ready" : "✗ Missing"}\n`);
});