// ===== Data =====
const products = [
  { id: 1, title: "شال دست‌باف پشمی", cat: "پوشاک", price: 1800, old: 2200, emoji: "🧣", bg: "#fbe3d6", rating: 5, tag: "پرفروش" },
  { id: 2, title: "زعفران ناب هرات (۵ گرم)", cat: "خوراکی", price: 950, emoji: "🌸", bg: "#f3e1f5", rating: 5, tag: "ویژه" },
  { id: 3, title: "کاسه سفالی دست‌ساز", cat: "صنایع دستی", price: 650, emoji: "🏺", bg: "#f6e7d3", rating: 4 },
  { id: 4, title: "کشمش سبز درجه یک (۱ کیلو)", cat: "خوراکی", price: 420, emoji: "🍇", bg: "#e4f2dc", rating: 4 },
  { id: 5, title: "پیراهن سنتی گلدوزی‌شده", cat: "پوشاک", price: 2600, old: 3100, emoji: "👘", bg: "#dfeaf7", rating: 5, tag: "جدید" },
  { id: 6, title: "قالیچه دست‌باف کوچک", cat: "صنایع دستی", price: 5400, emoji: "🧶", bg: "#f7dcdc", rating: 5 },
  { id: 7, title: "بادام کاغذی (۱ کیلو)", cat: "خوراکی", price: 780, emoji: "🥜", bg: "#f5ecd8", rating: 4 },
  { id: 8, title: "گردنبند لاجورد", cat: "زیورآلات", price: 1350, emoji: "📿", bg: "#dbe4fb", rating: 5, tag: "ویژه" },
  { id: 9, title: "چای سبز معطر (۵۰۰ گرم)", cat: "خوراکی", price: 300, emoji: "🍵", bg: "#e2f3e7", rating: 4 },
  { id: 10, title: "کلاه قره‌قل", cat: "پوشاک", price: 3200, emoji: "🎩", bg: "#e8e3dc", rating: 4 },
  { id: 11, title: "انگشتر نقره با نگین فیروزه", cat: "زیورآلات", price: 1900, old: 2300, emoji: "💍", bg: "#d9f2f1", rating: 5 },
  { id: 12, title: "گلدان مسی قلم‌زنی", cat: "صنایع دستی", price: 2100, emoji: "⚱️", bg: "#f8e2cc", rating: 4, tag: "جدید" },
];

// ===== Helpers =====
const $ = (s) => document.querySelector(s);
const fa = (n) => Number(n).toLocaleString("fa-IR");
const money = (n) => `${fa(n)} ؋`;

const store = {
  get() { try { return JSON.parse(localStorage.getItem("wakhshe-cart")) || {}; } catch { return {}; } },
  set(v) { try { localStorage.setItem("wakhshe-cart", JSON.stringify(v)); } catch {} },
};

let cart = store.get();
let activeCat = "همه";
let query = "";

// ===== Products =====
function renderFilters() {
  const cats = ["همه", ...new Set(products.map((p) => p.cat))];
  $("#filters").innerHTML = cats
    .map((c) => `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${c}</button>`)
    .join("");
}

function renderProducts() {
  const list = products.filter(
    (p) => (activeCat === "همه" || p.cat === activeCat) && p.title.includes(query.trim())
  );
  $("#emptyState").hidden = list.length > 0;
  $("#productGrid").innerHTML = list
    .map(
      (p) => `
    <article class="card">
      <div class="card__img" style="background:${p.bg}">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
        <span>${p.emoji}</span>
      </div>
      <div class="card__body">
        <span class="card__cat">${p.cat}</span>
        <h3 class="card__title">${p.title}</h3>
        <span class="card__rating">${"★".repeat(p.rating)}${"☆".repeat(5 - p.rating)}</span>
        <div class="card__foot">
          <span class="price">${money(p.price)}${p.old ? `<del>${fa(p.old)}</del>` : ""}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="افزودن به سبد">+</button>
        </div>
      </div>
    </article>`
    )
    .join("");
}

// ===== Cart =====
function cartList() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ ...products.find((p) => p.id === +id), qty }))
    .filter((i) => i.id);
}

function renderCart() {
  const items = cartList();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  $("#cartCount").textContent = fa(count);
  $("#cartTotal").textContent = money(total);
  $("#checkoutBtn").disabled = !items.length;
  $("#checkoutBtn").style.opacity = items.length ? 1 : 0.5;

  $("#cartItems").innerHTML = items.length
    ? items
        .map(
          (i) => `
      <div class="cart-item">
        <div class="cart-item__img" style="background:${i.bg}">${i.emoji}</div>
        <div class="cart-item__info">
          <strong>${i.title}</strong>
          <span>${money(i.price)}</span>
          <div><button class="remove" data-remove="${i.id}">حذف</button></div>
        </div>
        <div class="qty">
          <button data-inc="${i.id}" aria-label="افزایش">+</button>
          <span>${fa(i.qty)}</span>
          <button data-dec="${i.id}" aria-label="کاهش">−</button>
        </div>
      </div>`
        )
        .join("")
    : `<div class="cart-empty"><div>🛒</div><p>سبد خرید شما خالی است.</p></div>`;

  store.set(cart);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  toast("به سبد خرید اضافه شد ✓");
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

// ===== UI =====
function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  $("#overlay").hidden = false;
}
function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  $("#overlay").hidden = true;
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ===== Events =====
$("#filters").addEventListener("click", (e) => {
  const cat = e.target.dataset.cat;
  if (!cat) return;
  activeCat = cat;
  renderFilters();
  renderProducts();
});

$("#searchInput").addEventListener("input", (e) => {
  query = e.target.value;
  renderProducts();
});

$("#productGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add);
});

$("#cartItems").addEventListener("click", (e) => {
  const d = e.target.dataset;
  if (d.inc) changeQty(d.inc, 1);
  if (d.dec) changeQty(d.dec, -1);
  if (d.remove) { delete cart[d.remove]; renderCart(); }
});

$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
document.querySelectorAll("#nav a").forEach((a) =>
  a.addEventListener("click", () => $("#nav").classList.remove("open"))
);

$("#checkoutBtn").addEventListener("click", () => {
  if (!cartList().length) return;
  closeCart();
  $("#checkoutModal").hidden = false;
});
$("#closeModal").addEventListener("click", () => ($("#checkoutModal").hidden = true));
$("#checkoutModal").addEventListener("click", (e) => {
  if (e.target.id === "checkoutModal") e.target.hidden = true;
});

$("#checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = new FormData(e.target).get("name");
  cart = {};
  renderCart();
  e.target.reset();
  $("#checkoutModal").hidden = true;
  toast(`${name} عزیز، سفارش شما با موفقیت ثبت شد 🎉`);
});

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  e.target.reset();
  toast("پیام شما ارسال شد. به زودی پاسخ می‌دهیم.");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeCart(); $("#checkoutModal").hidden = true; }
});

// ===== Init =====
$("#year").textContent = new Date().getFullYear().toLocaleString("fa-IR", { useGrouping: false });
renderFilters();
renderProducts();
renderCart();
