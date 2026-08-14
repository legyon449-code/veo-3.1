// server.js
// Veo 3.1 (Google Gemini API) orqali video generatsiya qiluvchi backend server

import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// .env faylida GEMINI_API_KEY ni saqlang (frontendga hech qachon chiqarilmaydi)
const API_KEY = process.env.GEMINI_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Qaysi model ishlatilishini shu yerdan boshqarasiz:
// "veo-3.1-generate-preview" (sifat) yoki "veo-3.1-fast-generate-preview" (tezroq/arzonroq)
const MODEL = process.env.VEO_MODEL || "veo-3.1-generate-preview";

if (!API_KEY) {
  console.warn(
    "OGOHLANTIRISH: GEMINI_API_KEY .env faylida topilmadi. Google AI Studio'dan API key oling."
  );
}

// 1) Video generatsiyani boshlash (uzoq davom etadigan operatsiya)
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, imageBase64, imageMimeType } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt bo'sh bo'lmasligi kerak" });
    }

    const instance = { prompt };

    // Agar rasm yuborilgan bo'lsa (image-to-video)
    if (imageBase64) {
      instance.image = {
        bytesBase64Encoded: imageBase64,
        mimeType: imageMimeType || "image/png",
      };
    }

    const response = await fetch(
      `${BASE_URL}/models/${MODEL}:predictLongRunning`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({ instances: [instance] }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Veo API xatosi:", data);
      return res.status(response.status).json({ error: data });
    }

    // data.name -> operatsiya nomi, keyin shu bilan holatni tekshiramiz
    res.json({ operationName: data.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

// 2) Operatsiya holatini tekshirish (frontend buni har 5-10 soniyada so'raydi)
app.get("/api/status/:operationName(*)", async (req, res) => {
  try {
    const operationName = req.params.operationName;

    const response = await fetch(`${BASE_URL}/${operationName}`, {
      headers: { "x-goog-api-key": API_KEY },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    if (!data.done) {
      return res.json({ done: false });
    }

    // Tayyor bo'lganda video faylga havola qaytadi
    const videoUri =
      data.response?.generateVideoResponse?.generatedSamples?.[0]?.video
        ?.uri;

    if (!videoUri) {
      return res.status(500).json({ error: "Video topilmadi", raw: data });
    }

    res.json({ done: true, videoUri });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

// 3) Video faylni Google serveridan olib, foydalanuvchiga uzatish (API keyni yashirish uchun)
app.get("/api/video", async (req, res) => {
  try {
    const { uri } = req.query;
    if (!uri) return res.status(400).json({ error: "uri kerak" });

    const response = await fetch(uri, {
      headers: { "x-goog-api-key": API_KEY },
    });

    if (!response.ok) {
      return res.status(response.status).send("Videoni olishda xatolik");
    }

    res.setHeader("Content-Type", "video/mp4");
    response.body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatosi", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
