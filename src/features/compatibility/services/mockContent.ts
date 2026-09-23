/**
 * Copy used by the mock reading service. Everything here is keyed off the
 * computed astrology facts (sun sign element/modality, year animal) so mock
 * readings still reflect the real input — they're just template-written, not AI-written.
 */
import type { ElementRelation } from "../astrology/index.ts";
import type { Nickname, WesternElement } from "../types/compatibility.ts";

export const LOVE_NICKNAMES: Record<string, Nickname> = {
  aries: { title: "Bình gas mini", reason: "Bật lửa là cháy, thích ai là tiến liền, không có khái niệm “để từ từ tính”." },
  taurus: { title: "Két sắt tình cảm", reason: "Mở lòng chậm lắm, nhưng đã mở thì giữ kỹ như giữ mật khẩu ngân hàng." },
  gemini: { title: "Đài phát thanh 24/7", reason: "Tin nhắn tới dồn dập, chủ đề đổi nhanh như chuyển kênh." },
  cancer: { title: "Nồi cơm điện chế độ giữ ấm", reason: "Lo cho người ta từng bữa, mà giận thì cũng âm ỉ lâu y chang." },
  leo: { title: "Đèn sân khấu di động", reason: "Tới đâu sáng tới đó, và thật lòng cần được khen đúng lúc." },
  virgo: { title: "Kiểm duyệt viên tin nhắn", reason: "Đọc lại câu định gửi ba lần, để ý cả dấu chấm của đối phương." },
  libra: { title: "Cán cân dỗ dành", reason: "Ghét cãi nhau, giỏi hòa giải, nhưng chọn quán ăn thì mất 45 phút." },
  scorpio: { title: "Máy quét tâm can", reason: "Nhìn một cái là đọc được nửa tâm sự, tin ai thì tin rất sâu." },
  sagittarius: { title: "Vali luôn mở sẵn", reason: "Yêu tự do, rủ đi là đi, ngồi yên một chỗ lâu là bứt rứt." },
  capricorn: { title: "Kế hoạch 5 năm biết đi", reason: "Yêu mà cũng có lộ trình, KPI và mốc kiểm tra định kỳ." },
  aquarius: { title: "Wifi tần số lạ", reason: "Kết nối mạnh lắm, nhưng không phải ai cũng bắt được sóng." },
  pisces: { title: "Máy chiếu phim tình cảm", reason: "Từ một cái “seen” có thể tưởng tượng ra nguyên bộ phim 16 tập." },
};

export const FRIEND_NICKNAMES: Record<string, Nickname> = {
  aries: { title: "Trưởng phòng chốt kèo", reason: "Rủ là đi, không cần họp, không cần vote, 10 phút sau có mặt." },
  taurus: { title: "Thủ quỹ kiêm food reviewer", reason: "Biết quán nào ngon, và cũng biết ai chưa chuyển khoản." },
  gemini: { title: "Admin group chat", reason: "99+ tin nhắn chưa đọc, đoán xem một nửa là của ai?" },
  cancer: { title: "Túi Doraemon của hội", reason: "Mang theo khăn giấy, dầu gió, đồ ăn vặt và cả drama của mọi người." },
  leo: { title: "Idol chính của hội", reason: "Người được chụp ảnh nhiều nhất, và cũng là người pose nhiệt nhất." },
  virgo: { title: "Trợ lý Google Sheet", reason: "Lên lịch trình tới từng tiếng, chia tiền tới từng nghìn." },
  libra: { title: "Đại sứ hòa bình group chat", reason: "Hội cãi nhau là có mặt, nói một câu ai cũng dịu xuống." },
  scorpio: { title: "Két bảo mật bí mật", reason: "Giữ bí mật kín như bưng, nhưng cũng nhớ dai ai từng hứa gì." },
  sagittarius: { title: "Hướng dẫn viên kèo lầy", reason: "Chuyên đề xuất mấy kèo đi chơi không ai dám nghĩ tới." },
  capricorn: { title: "Quản lý tài chính bất đắc dĩ", reason: "Người duy nhất nhớ hạn đặt vé và nhắc cả hội tiết kiệm." },
  aquarius: { title: "Kho meme độc quyền", reason: "Gửi meme mà cả hội phải mất 3 phút mới hiểu, xong cười cả tuần." },
  pisces: { title: "Tổng đài tâm sự 2 giờ sáng", reason: "Nghe hết, hiểu hết, đồng cảm tới mức khóc chung." },
};

export const ELEMENT_TRAITS: Record<WesternElement, { vibe: string; needs: string; talk: string }> = {
  fire: {
    vibe: "nhiệt, nhanh, thích hành động",
    needs: "cần sự hào hứng và được ghi nhận",
    talk: "nói thẳng, nói nhanh, nóng lên cũng nhanh mà nguội cũng nhanh",
  },
  earth: {
    vibe: "thực tế, chắc chắn, chậm mà chắc",
    needs: "cần sự ổn định và hành động cụ thể hơn lời hứa",
    talk: "ít hoa mỹ, thích đi thẳng vào việc cần làm",
  },
  air: {
    vibe: "tò mò, nhiều ý tưởng, thích trò chuyện",
    needs: "cần không gian và những cuộc nói chuyện thú vị",
    talk: "thích phân tích, đôi khi lý trí tới mức quên hỏi “bạn thấy sao?”",
  },
  water: {
    vibe: "cảm xúc sâu, nhạy, giàu trực giác",
    needs: "cần cảm giác an toàn và được thấu hiểu",
    talk: "nói bằng cảm xúc, đôi khi mong người kia tự hiểu mà không cần nói",
  },
};

/** Short image for each element pairing, e.g. "gió thổi lửa bùng". */
export function pairImage(rel: ElementRelation, a: WesternElement, b: WesternElement): string {
  const pair = [a, b].sort().join("-");
  switch (rel) {
    case "same":
      return {
        fire: "hai ngọn lửa đứng cạnh nhau",
        earth: "hai tảng đá cùng một nền",
        air: "hai cơn gió cùng chiều",
        water: "hai dòng nước chảy chung",
      }[a];
    case "complementary":
      return pair === "air-fire" ? "gió thổi lửa bùng" : "nước tưới đất, đất giữ nước";
    case "mixed":
      return pair === "earth-fire" ? "lửa muốn đi nhanh, đất muốn đi chắc" : "gió nghĩ bằng đầu, nước cảm bằng tim";
    case "contrasting":
      return pair === "fire-water" ? "lửa gặp nước — nóng lạnh thất thường" : "gió bay bổng, đất bám mặt đất";
  }
}
