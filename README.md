# betamlinh

> Your stars, be's tea ☕🔮

Website xem độ hợp **tình iu** và **bè bạn** cùng **be**, thầy tử vi hệ Gen Z. Dùng React, Vite, TypeScript, Tailwind CSS v4, React Router và Lucide.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + build production
npm run preview
```

Mặc định app chạy bằng **mock service** nên không cần API key. Kết quả mock được gắn nhãn "Bản mẫu (mock), chưa phải AI" trên trang kết quả.

### Bật AI (Gemini, có free tier)

1. Lấy API key miễn phí tại https://aistudio.google.com/apikey (không cần thẻ).
2. Copy `.env.example` thành `.env.local`, đặt `VITE_READING_SOURCE=api` và `GEMINI_API_KEY=...`. Model mặc định là `gemini-3.6-flash`; có thể đổi bằng `GEMINI_MODEL` (model nào dùng được tùy key, xem trong AI Studio).
3. `npm run dev`. Vite dev server phục vụ `POST /api/reading` qua `server/devApiPlugin.ts`.
4. Khi deploy lên Vercel: `api/reading.ts` là serverless function. Khai báo `GEMINI_API_KEY` trong Environment Variables của Vercel.

API key chỉ được đọc ở server (các biến không có tiền tố `VITE_`) và **không bao giờ** có trong bundle frontend.

Gói free của Gemini rất hạn chế: key hiện tại chỉ dùng được `gemini-3.6-flash`, **20 lượt mỗi ngày** (mỗi lần xem tốn 1 lượt). Khi hết lượt, API trả lỗi 429 và website hiện màn "be hết lượt đọc sao hôm nay rồi" có nút Thử lại. Ở gói free, Google có thể dùng nội dung gửi lên (tên/nickname, ngày sinh) để cải thiện sản phẩm.

**Dự phòng bằng Groq (không bắt buộc):** đặt `GROQ_API_KEY` (lấy free tại https://console.groq.com/keys, không cần thẻ). Khi Gemini hết lượt, quá tải hoặc lỗi mạng, server tự chuyển sang Groq (`openai/gpt-oss-120b`). Gói free của Groq giới hạn 8.000 token mỗi phút và 200.000 token mỗi ngày, tức khoảng 1 lượt xem mỗi phút và khoảng 25 lượt mỗi ngày.

Phần gọi model nằm trong `server/providers/`. `geminiProvider.ts` đang dùng, với structured output theo JSON schema của từng mode. `claudeProvider.ts` và `kimiProvider.ts` được giữ lại nhưng đang tắt; hướng dẫn bật lại nằm ở đầu mỗi file.

## Sitemap

| Route | Trang |
| --- | --- |
| `/` | Homepage: be chào và 2 mode card (không có form) |
| `/:mode/nguoi-thu-nhat` | Nhập Person A (`mode` = `tinh-iu` \| `be-ban`) |
| `/:mode/nguoi-thu-hai` | Nhập Person B |
| `/:mode/kiem-tra` | Review và sửa từng người |
| `/:mode/dang-xem` | be đang đọc (loading / error / retry) |
| `/:mode/ket-qua` | Kết quả (empty state nếu chưa có) |

Mọi form đều nằm dưới `/:mode`, nên người dùng buộc phải chọn mode trước. Slug không hợp lệ sẽ quay về trang chủ.

## Kiến trúc

```
server/                     # chỉ chạy ở server
  readingHandler.ts         # validate request → tính dữ liệu → gọi AI → validate output
  providers/                # geminiProvider (chính), groqProvider (dự phòng), claudeProvider & kimiProvider (tạm tắt)
  devApiPlugin.ts           # /api/reading cho vite dev/preview
api/reading.ts              # serverless function (Vercel)
src/
  app/                      # App.tsx, router.tsx
  components/
    be/                     # BeAvatar (SVG placeholder, có mood), BeSpeech, BeErrorState
    layout/                 # AppShell, Starfield, ZodiacWheel
    ui/                     # Button, TextField
  features/compatibility/
    astrology/              # tính cung Mặt Trời, can chi, quan hệ nguyên tố/con giáp
    config/                 # modes.ts (tiêu chí, section, copy theo mode), routes.ts
    prompts/                # systemPrompt, lovePrompt, friendshipPrompt, promptBuilder
    services/               # readingService (chọn nguồn), kimiService, mockReadingService
    state/                  # CompatibilityContext (sessionStorage, chỉ flow hiện tại)
    components/ pages/ types/ utils/ (validation, parseResult)
```

### Độ chính xác dữ liệu tử vi

- **Có tính:** cung Mặt Trời theo ngày sinh (đánh dấu *sát ranh giới* khi ngày sinh cách ranh giới cung ±1 ngày) và năm can chi / con giáp.
- **Sinh từ 21/01 đến 20/02:** chưa biết đã qua Tết âm lịch hay chưa, nên con giáp được đánh dấu *chưa chắc chắn* và không được dùng để chấm điểm.
- **Chưa tính:** cung mọc, Moon sign, vị trí hành tinh, bát tự và lá số. Giờ sinh và nơi sinh được ghi nhận nhưng chưa dùng. Prompt cấm AI tự suy diễn những dữ liệu này, và trang kết quả luôn hiển thị phần giới hạn.

### Điểm số

`utils/parseResult.ts` kiểm tra mọi kết quả, dù là AI hay mock:

- Parse JSON an toàn.
- Kiểm tra đủ trường theo mode.
- Điểm nằm ngoài khoảng 0–100 hoặc không hợp lệ sẽ thành `null`.
- `overall` luôn được tính lại bằng trung bình các điểm hợp lệ (làm tròn). Nếu không có điểm hợp lệ nào thì là `null`. Số `overall` do model trả về bị bỏ qua.

## Giới hạn hiện tại

- Nút chia sẻ gửi **tóm tắt dạng text** (Web Share API, hoặc copy nếu không có). Kết quả không được lưu trên server nên chưa có link chia sẻ.
- `BeAvatar` là placeholder SVG. Có thể thay illustration thật mà giữ nguyên props `mood` và `size`.
- Chưa test gọi Gemini API thật (chưa có key). Đường API đã được test với response giả lập.
