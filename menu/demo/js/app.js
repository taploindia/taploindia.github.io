document.addEventListener("DOMContentLoaded", () => {
  loadBusiness();
  loadMenu();
});

/* =========================
   LOAD BUSINESS DATA
========================= */
function loadBusiness() {
  fetch("./data/business.json")
    .then(res => res.json())
    .then(data => renderBusiness(data))
    .catch(err => console.error("Business JSON error:", err));
}

function renderBusiness(data) {

  /* ===== BASIC INFO ===== */
  setText("#restaurantName", data.identity.name);
  setText("#categoryLine", data.identity.categoryLine);

  if (data.identity.hasLogo) {
    setImage("#restaurantLogo", "./assets/logo.png");
  }

  /* ===== VEG / NON-VEG BADGE ===== */
  const badge = document.createElement("div");
  badge.className =
    data.identity.foodType === "veg"
      ? "badge veg-badge"
      : data.identity.foodType === "non-veg"
      ? "badge nonveg-badge"
      : "badge nonveg-badge";

  badge.textContent =
    data.identity.foodType === "veg"
      ? "🟢 Pure Veg Restaurant"
      : data.identity.foodType === "non-veg"
      ? "🔴 Non-Veg Restaurant"
      : "🔴 Veg & Non-Veg Restaurant";

  document.querySelector(".header").appendChild(badge);

  /* ===== CONTACT ===== */
  setLink("#callPrimary", "tel:" + data.contact.primaryPhone);
  setText("#primaryPhoneText", data.contact.primaryPhone);

  /* Secondary phone (hide if empty) */
  const secondaryRow = document.querySelector("#secondaryPhoneText")?.parentElement;
  if (data.contact.secondaryPhone) {
    document.querySelector("#secondaryPhoneText").textContent = data.contact.secondaryPhone;
  } else if (secondaryRow) {
    secondaryRow.style.display = "none";
  }

  setLink(
    "#whatsappBtn",
    "https://wa.me/" + cleanNumber(data.contact.whatsappNumber)
  );

  /* Email (hide if empty) */
  const emailRow = document.querySelector("#emailText")?.parentElement;
  if (data.contact.email) {
    document.querySelector("#emailText").textContent = data.contact.email;
  } else if (emailRow) {
    emailRow.style.display = "none";
  }

  /* ===== LOCATION (hide if empty) ===== */
  const addressRow = document.querySelector("#fullAddress")?.parentElement;
  if (data.location && data.location.fullAddress) {
    document.querySelector("#fullAddress").textContent = data.location.fullAddress;
    setLink("#mapBtn", data.location.googleMapLink);
  } else if (addressRow) {
    addressRow.style.display = "none";
  }

  /* ===== OPENING HOURS ===== */
  renderOpeningHours(data.openingHours);

  /* ===== DELIVERY / DINE IN ===== */
  setText(
    "#deliveryInfo",
    data.flags.deliveryAvailable ? "🚚 Delivery Available" : ""
  );
  setText(
    "#dineInInfo",
    data.flags.dineInAvailable ? "🍽️ Dine-In Available" : ""
  );

  /* ===== PAYMENT ===== */
  if (data.payment.enabled) {
    setImage("#paymentQR", "./assets/payment.png");
  }

  /* ===== ONLINE PLATFORMS (NO CHANGE) ===== */
  setLink("#zomatoBtn", data.onlinePlatforms.zomato);
  setLink("#swiggyBtn", data.onlinePlatforms.swiggy);
  setLink("#instaIcon", data.onlinePlatforms.instagram);
  setLink("#fbIcon", data.onlinePlatforms.facebook);
  setLink("#googleIcon", data.onlinePlatforms.google);
  setLink("#websiteIcon", data.onlinePlatforms.website);
  setLink("#googleReviewBtn", data.onlinePlatforms.google);
  setLink("#instagramBtn", data.onlinePlatforms.instagram);


  /* ===== TRUST ===== */
  renderBadges(data.trustInfo.badges);
  setText("#aboutText", data.trustInfo.about);
}

/* =========================
   LOAD MENU DATA
========================= */
function loadMenu() {
  fetch("./data/menu.json")
    .then(res => res.json())
    .then(data => renderMenu(data.categories))
    .catch(err => console.error("Menu JSON error:", err));
}

function renderMenu(categories) {
  const container = document.querySelector("#menuContainer");
  container.innerHTML = "";

  categories.forEach(category => {
    const section = document.createElement("section");
    section.className = "menu-category";

    section.innerHTML = `<h2 class="category-title">${category.name}</h2>`;

    const vegItems = category.items.filter(i => i.type === "veg");
    const nonVegItems = category.items.filter(i => i.type === "non-veg");

    if (vegItems.length) {
      section.appendChild(buildMenuBlock("Veg Items", vegItems, "veg"));
    }
    if (nonVegItems.length) {
      section.appendChild(buildMenuBlock("Non-Veg Items", nonVegItems, "nonveg"));
    }

    const divider = document.createElement("div");
    divider.className = "menu-section-divider";
    section.appendChild(divider);

    container.appendChild(section);
  });
}

function buildMenuBlock(title, items, type) {
  const block = document.createElement("div");
  block.className = `menu-block ${type}`;

  block.innerHTML = `<h3 class="${type}-title">${title}</h3>`;

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "menu-item";

    let prices = "";
    item.prices.forEach(p => {
      prices += `
        <div class="price-line">
          <span>${p.label}</span>
          <span>₹${p.price}</span>
        </div>`;
    });

    div.innerHTML = `
      <div class="item-header">
        <img class="food-icon" src="/assets/icons/color-icons/${item.type}.svg">
        <strong>${item.name}</strong>
      </div>
      ${prices}
      ${item.description ? `<div class="item-desc">${item.description}</div>` : ""}
    `;

    block.appendChild(div);
  });

  return block;
}

/* =========================
   HELPERS
========================= */
function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el && val !== undefined) el.textContent = val;
}
function setImage(sel, src) {
  const el = document.querySelector(sel);
  if (el) el.src = src;
}
function setLink(sel, href) {
  const el = document.querySelector(sel);
  if (el && href) el.href = href;
}
function cleanNumber(num) {
  return num ? num.replace(/\D/g, "") : "";
}
function renderBadges(badges) {
  const box = document.querySelector("#badgeContainer");
  box.innerHTML = "";
  badges.forEach(b => {
    const s = document.createElement("span");
    s.className = "badge";
    s.textContent = b;
    box.appendChild(s);
  });
}

/* ===== OPENING HOURS ===== */
function renderOpeningHours(hours) {
  const box = document.querySelector("#timingBox");
  box.innerHTML = "";

  Object.keys(hours).forEach(day => {
    const d = hours[day];
    const row = document.createElement("div");
    row.className = "timing-row";

    const left = document.createElement("span");
    left.textContent = capitalize(day);

    const right = document.createElement("span");
    right.textContent = d.isClosed
      ? "Closed"
      : d.slots.map(s => `${toAMPM(s.open)} – ${toAMPM(s.close)}`).join(" | ");

    row.append(left, right);
    box.appendChild(row);
  });
}

function toAMPM(t) {
  let [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ap}`;
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
