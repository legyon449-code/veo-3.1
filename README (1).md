# Veo 3.1 Video Generator — veb-sayt

O'zbek tilida qisqacha yo'riqnoma.

## Nima qiladi

Foydalanuvchi matn (prompt) yozadi (yoki rasm yuklaydi), sayt shu asosda
Google'ning **Veo 3.1** modeli orqali video generatsiya qiladi va natijani
saytda ko'rsatadi + yuklab olish imkonini beradi.

## 1-qadam: API key olish

1. https://aistudio.google.com/apikey ga kiring (Google akkaunt bilan).
2. "Create API key" tugmasini bosing va kalitni nusxalang.
3. **Diqqat:** Veo 3.1 hozircha to'lovli (paid preview) — Google Cloud
   billing hisobingiz ulangan bo'lishi kerak.

## 2-qadam: Loyihani sozlash

```bash
cd veo-video-site
npm install
cp .env.example .env
```

`.env` faylini oching va `GEMINI_API_KEY` qatoriga o'z kalitingizni yozing:

```
GEMINI_API_KEY=AIzaSy...sizning_kalitingiz
```

## 3-qadam: Ishga tushirish

```bash
npm start
```

Brauzerda oching: **http://localhost:3000**

## Qanday ishlaydi (texnik qism)

- `server.js` — Express backend. API keyni frontendga chiqarmaydi,
  barcha so'rovlarni server orqali Google API'ga yuboradi.
- `/api/generate` — video generatsiyani boshlaydi (`predictLongRunning`),
  bu uzoq davom etadigan operatsiya bo'lgani uchun darhol video qaytmaydi.
- `/api/status/:operationName` — frontend har 6 soniyada shu endpointni
  so'rab, operatsiya tugaganini tekshiradi (video 1-3 daqiqa davomida tayyor bo'ladi).
- `/api/video` — tayyor bo'lgan videoni Google serveridan olib,
  API keyni oshkor qilmasdan foydalanuvchiga uzatadi.
- `public/index.html` — oddiy, chiroyli frontend (prompt kiritish,
  ixtiyoriy rasm yuklash, progress ko'rsatish, video pleer).

## Xohishga ko'ra o'zgartirish mumkin bo'lgan narsalar

- **Model:** `.env` faylida `VEO_MODEL` ni `veo-3.1-fast-generate-preview`
  ga o'zgartirsangiz tezroq va arzonroq bo'ladi (sifat biroz pastroq).
- **Image-to-video:** frontendda rasm yuklash maydoni allaqachon bor —
  rasm yuklansa, video o'sha rasmdan boshlanadi.
- **Narx:** Veo 3.1 daqiqasiga to'lovli, aniq narxni Google AI Studio
  billing sahifasidan tekshiring, chunki narxlar vaqt o'tishi bilan
  o'zgarishi mumkin.

## Deploy qilish (ixtiyoriy)

Bu oddiy Node.js/Express ilova — Railway, Render, Fly.io yoki har qanday
VPS'da ishga tushirish mumkin. Faqat `GEMINI_API_KEY` environment
variable sifatida (hech qachon frontend kodida emas!) qo'shilishi kerak.
