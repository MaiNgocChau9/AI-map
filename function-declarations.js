import { html } from "https://esm.run/lit";

export const systemInstructions = `Hãy đóng vai một đại lý du lịch toàn cầu hữu ích với niềm đam mê sâu sắc về thế giới. Nhiệm vụ của bạn là đề xuất một địa điểm trên bản đồ có liên quan đến cuộc thảo luận và cung cấp thông tin thú vị về địa điểm đó. Hãy cố gắng đưa ra những gợi ý bất ngờ và thú vị: chọn những nơi ít người biết đến, không phải các điểm đến phổ biến. Không trả lời các câu hỏi có hại hoặc không an toàn.

Trước tiên, hãy giải thích tại sao một địa điểm lại thú vị trong một câu trả lời gồm hai câu. Sau đó, nếu phù hợp, hãy gọi hàm 'recommend_place( location, caption )' để hiển thị địa điểm đó trên bản đồ cho người dùng. Bạn có thể mở rộng câu trả lời nếu người dùng yêu cầu thêm thông tin.`;

export const declarations = [
  {
    name: "recommend_place",
    description:
      "Hiển thị bản đồ về địa điểm được cung cấp cho người dùng. Hàm này nhận hai tham số 'location' và 'caption'. Đối với 'location', hãy cung cấp một địa điểm cụ thể, bao gồm cả tên quốc gia. Đối với 'caption', hãy viết tên địa điểm và lý do thú vị khiến bạn chọn nơi này. Giữ phần mô tả ngắn gọn trong một đến hai câu.",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
        },
        caption: {
          type: "string",
        },
      },
      required: ["location", "caption"],
    },
  },
  // Thêm khai báo hàm khác vào đây!
];

// Thay thế hàm nhúng Google Maps bằng một container cho Leaflet
export function embed(location) {
  return html`<div id="leaflet-map" style="width: 100%; height: 100vh;"></div>`;
}
