import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai@0.21.0";
import * as mapsFunction from "./function-declarations.js";
import { presets } from "./presets.js";
import { html, render } from "https://esm.run/lit";

// Biến toàn cục lưu instance của Leaflet map
let leafletMap = null;

const client = new GoogleGenerativeAI("AIzaSyA6nRUwDozn7hYsRbqGXAtWwm1QU09Umwk");
const systemInstruction = mapsFunction.systemInstructions;

const functionDeclarations = mapsFunction.declarations.map(declaration => ({
  ...declaration,
  callback: (args) => {
    const { location, caption } = args;
    renderPage(location, caption);
  },
}));

const chat = async (userText) => {
  try {
    const temperature = 2; // High temperature for answer variety
    const { response } = await client
      .getGenerativeModel(
        { model: 'models/gemini-2.0-flash-exp', systemInstruction },
        { apiVersion: 'v1beta' }
      )
      .generateContent({
        contents: [
          {
            role: "user",
            parts: [{ text: userText }],
          },
        ],
        generationConfig: { temperature },
        tools: [{ functionDeclarations }]
      });

    const call = response.functionCalls()[0];

    if (call) {
      functionDeclarations[0].callback(call.args);
    }
  } catch (e) {
    console.error(e);
  }
};

async function init() {
  renderPage("%"); // Start by rendering with empty location query: shows earth
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.removeAttribute("data-theme"); // Use default (dark)
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

init();

function renderPage(location, caption = "") {
  const root = document.querySelector("#root");
  caption = caption.replace(/\\/g, '');
  render(
    html`
      <div id="map">
        ${mapsFunction.embed(location)}
      </div>
      ${caption
        ? html`<div id="caption"><p>${caption}</p></div>`
        : ""}
      <div id="presets-container">
        <input
          id="location-input"
          type="text"
          placeholder="Take me somewhere..."
        />
        <div id="presets">
          ${presets.map(
            ([name, message]) =>
              html`<button @click=${() => chat(message)} class="preset">
                        ${name}
                      </button>`
          )}
        </div>
      </div>
    `,
    root
  );
  
  // Sau khi render, thêm sự kiện cho ô input
  const input = document.getElementById("location-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const inputValue = input.value.trim();
        if (inputValue) {
          chat(inputValue);
        }
      }
    });
  }
  // Sau khi render, khởi tạo lại bản đồ Leaflet với lớp ảnh vệ tinh và thêm marker màu đỏ
  initializeLeafletMap(location);
}

async function initializeLeafletMap(location) {
  // Nếu đã có bản đồ, xoá trước khi tạo mới
  if (leafletMap) {
    leafletMap.remove();
    leafletMap = null;
  }

  let lat = 0, lon = 0, zoom = 2;
  let validLocation = false;
  if (location && location.trim() !== "" && location !== "%") {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
        zoom = 12;
        validLocation = true;
      }
    } catch (e) {
      console.error("Lỗi khi gọi API geocoding của Nominatim:", e);
    }
  }
  // Khởi tạo bản đồ Leaflet mới và gán vào biến toàn cục
  leafletMap = L.map('leaflet-map').setView([lat, lon], zoom);

  // Thêm lớp tile của Esri World Imagery (ảnh vệ tinh)
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Sản phẩm thuộc về tác giả Mai Ngọc Châu'
    }
  ).addTo(leafletMap);

  // Nếu có vị trí hợp lệ, thêm marker màu đỏ
  if (validLocation) {
    const redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.marker([lat, lon], { icon: redIcon }).addTo(leafletMap);
  }
}
