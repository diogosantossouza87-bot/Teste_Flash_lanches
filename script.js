/* ============ CONFIGURAÇÃO ============ */
const CONFIG = {
  whatsapp: "5592988483505",   // número da lanchonete (DDI+DDD+número)
  fee: 6,                      // taxa de entrega
  freeFrom: 70,                // frete grátis a partir de
  pixKey: "diogosantossouza87@gmail.com, 5592988483505, 92988483505",  // chave Pix cadastrada no PicPay (e-mail, +5592..., CPF ou aleatória)
  pixName: "FLASH LANCHES",      // nome do recebedor: MAIÚSCULAS, sem acento (máx. 25)
  pixCity: "MANAUS"             // cidade: MAIÚSCULAS, sem acento (máx. 15)
};

/* ============ CATÁLOGO ============ */
const CATS = [
  { id: "lanches", name: "Lanches" },
  { id: "acomp",   name: "Acompanhamentos" },
  { id: "bebidas", name: "Bebidas" }
];
const PRODUCTS = [
  { id:1, cat:"lanches", name:"Flash Clássico", desc:"Blend 150 g, queijo prata, alface, tomate e molho da casa.", price:24.9, emoji:"🍔", bg:"#FFE3A3" },
  { id:2, cat:"lanches", name:"Duplo Bacon", desc:"Dois blends, cheddar, bacon crocante e cebola caramelizada.", price:32.9, emoji:"🥓", bg:"#FFC9C4" },
  { id:3, cat:"lanches", name:"Chicken Crisp", desc:"Frango empanado, maionese de ervas e picles.", price:27.9, emoji:"🍗", bg:"#FFD9B0" },
  { id:4, cat:"lanches", name:"Veggie Burger", desc:"Hambúrguer de grão-de-bico, rúcula e tomate seco.", price:26.9, emoji:"🥬", bg:"#CDEBC5" },
  { id:5, cat:"acomp", name:"Batata Frita", desc:"Porção crocante com sal e páprica.", price:14, emoji:"🍟", bg:"#FFF0A8" },
  { id:6, cat:"acomp", name:"Onion Rings", desc:"Anéis de cebola empanados, 10 unidades.", price:16, emoji:"🧅", bg:"#F5D9F0" },
  { id:7, cat:"acomp", name:"Nuggets (8 un.)", desc:"Frango macio com molho barbecue.", price:15.9, emoji:"🍤", bg:"#FFD9B0" },
  { id:8, cat:"bebidas", name:"Guaraná Lata", desc:"350 ml, bem gelado.", price:6.5, emoji:"🥤", bg:"#FFC9C4" },
  { id:9, cat:"bebidas", name:"Suco de Cupuaçu", desc:"Polpa natural, 400 ml.", price:9, emoji:"🍹", bg:"#FFF0A8" },
  { id:10, cat:"bebidas", name:"Milkshake de Chocolate", desc:"Cremoso, com calda e chantilly.", price:18, emoji:"🥛", bg:"#E6D3C5" }
];

/* ============ ESTADO E UTILITÁRIOS ============ */
const $ = s => document.querySelector(s);
const brl = n => n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
let cart = {};
try { cart = JSON.parse(localStorage.getItem("flash-cart")) || {}; } catch (e) { cart = {}; }
const save = () => { try { localStorage.setItem("flash-cart", JSON.stringify(cart)); } catch (e) {} };
const lines = () => Object.keys(cart).map(id => ({ p: PRODUCTS.find(x => x.id == id), q: cart[id] })).filter(l => l.p);
function totals() {
  const sub = lines().reduce((s, l) => s + l.p.price * l.q, 0);
  const fee = sub === 0 || sub >= CONFIG.freeFrom ? 0 : CONFIG.fee;
  return { sub, fee, total: sub + fee, qty: lines().reduce((s, l) => s + l.q, 0) };
}
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1600); }

/* ============ RENDER: CATÁLOGO ============ */
function renderMenu() {
  $("#chips").innerHTML = CATS.map((c, i) => `<button class="chip ${i ? "" : "on"}" data-cat="${c.id}">${c.name}</button>`).join("");
  $("#menu").innerHTML = CATS.map(c => `
    <section id="sec-${c.id}"><h2>${c.name}</h2><div class="grid">
    ${PRODUCTS.filter(p => p.cat === c.id).map(p => `
      <article class="card">
        <div class="art" style="background:${p.bg}" aria-hidden="true">${p.emoji}</div>
        <div class="card-b"><h3>${p.name}</h3><p>${p.desc}</p>
          <div class="row"><span class="price">${brl(p.price)}</span>
          <button class="add" data-add="${p.id}">Adicionar ao carrinho</button></div></div>
      </article>`).join("")}
    </div></section>`).join("");
}

/* ============ RENDER: CARRINHO ============ */
function summaryHTML(t) {
  return `<div><span>Subtotal</span><span>${brl(t.sub)}</span></div>
    <div><span>Taxa de entrega</span>${t.fee ? `<span>${brl(t.fee)}</span>` : `<span class="free">Grátis</span>`}</div>
    <div class="tot"><span>Total</span><span>${brl(t.total)}</span></div>`;
}
function renderCart() {
  const t = totals(), ls = lines();
  $("#count").textContent = t.qty;
  $("#bar").classList.toggle("show", t.qty > 0);
  $("#barQty").textContent = t.qty + (t.qty === 1 ? " item" : " itens");
  $("#barTotal").textContent = brl(t.total);
  $("#items").innerHTML = ls.length ? ls.map(({ p, q }) => `
    <div class="item">
      <div class="em" style="background:${p.bg}">${p.emoji}</div>
      <div class="nm">${p.name}<small>${brl(p.price)}</small><button class="rm" data-rm="${p.id}">Remover</button></div>
      <div class="qty"><button data-dec="${p.id}" aria-label="Diminuir">−</button><b>${q}</b><button data-inc="${p.id}" aria-label="Aumentar">+</button></div>
    </div>`).join("") : `<div class="empty">🍔<br>Seu carrinho está vazio.<br>Escolha um lanche no cardápio.</div>`;
  $("#sum").innerHTML = ls.length ? summaryHTML(t) : "";
  $("#goCheckout").disabled = !ls.length;
  save();
}
const setQty = (id, d) => { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; renderCart(); };

/* Abre/fecha gaveta */
function cartOpen(open) {
  $("#drawer").classList.toggle("open", open);
  $("#overlay").classList.toggle("open", open);
  $("#drawer").setAttribute("aria-hidden", !open);
}

/* ============ EVENTOS GERAIS ============ */
document.addEventListener("click", e => {
  const d = e.target.closest("[data-add],[data-inc],[data-dec],[data-rm],[data-cat]");
  if (!d) return;
  if (d.dataset.add) { setQty(+d.dataset.add, 1); toast("Adicionado ao carrinho"); }
  else if (d.dataset.inc) setQty(+d.dataset.inc, 1);
  else if (d.dataset.dec) setQty(+d.dataset.dec, -1);
  else if (d.dataset.rm) { delete cart[d.dataset.rm]; renderCart(); }
  else if (d.dataset.cat) {
    document.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c === d));
    $("#sec-" + d.dataset.cat).scrollIntoView({ behavior: "smooth" });
  }
});
["#openCart", "#barBtn"].forEach(s => $(s).addEventListener("click", () => cartOpen(true)));
["#closeCart", "#overlay"].forEach(s => $(s).addEventListener("click", () => cartOpen(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") { cartOpen(false); closeModal(); } });

/* ============ CHECKOUT ============ */
function openCheckout() {
  if (!lines().length) return;
  cartOpen(false);
  $("#sum2").innerHTML = summaryHTML(totals());
  $("#stepForm").style.display = ""; $("#stepOk").style.display = "none";
  $("#modal").classList.add("open"); $("#modal").scrollTop = 0;
  updatePay(); showPix();
}
function closeModal() { $("#modal").classList.remove("open"); }
$("#goCheckout").addEventListener("click", openCheckout);
$("#closeModal").addEventListener("click", closeModal);

/* ===== PIX com valor e QR Code reais (padrão BR Code do Banco Central) ===== */
function crc16(s) {
  let c = 0xFFFF;
  for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let k = 0; k < 8; k++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF; }
  return c.toString(16).toUpperCase().padStart(4, "0");
}
const tlv = (id, v) => id + String(v.length).padStart(2, "0") + v;
const ascii = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
function pixPayload(amount) {
  const acc = tlv("00", "BR.GOV.BCB.PIX") + tlv("01", CONFIG.pixKey);
  const p = tlv("00", "01") + tlv("26", acc) + tlv("52", "0000") + tlv("53", "986") + tlv("54", amount.toFixed(2)) +
    tlv("58", "BR") + tlv("59", ascii(CONFIG.pixName).slice(0, 25)) + tlv("60", ascii(CONFIG.pixCity).slice(0, 15)) + tlv("62", tlv("05", "***")) + "6304";
  return p + crc16(p);
}
let pixCode = "";
function showPix() {
  pixCode = pixPayload(totals().total);
  $("#pixCode").textContent = pixCode;
  const box = $("#qr"); box.innerHTML = "";
  if (typeof QRCode !== "undefined") new QRCode(box, { text: pixCode, width: 174, height: 174, correctLevel: QRCode.CorrectLevel.M });
}
$("#copyPix").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(pixCode); toast("Código PIX copiado!"); }
  catch (e) { const r = document.createRange(); r.selectNodeContents($("#pixCode")); getSelection().removeAllRanges(); getSelection().addRange(r); toast("Selecione e copie o código"); }
});

/* Alternância de método de pagamento */
const method = () => document.querySelector("input[name=pay]:checked").value;
function updatePay() {
  const m = method(), isCard = m !== "pix";
  $("#p-pix").classList.toggle("on", !isCard);
  $("#p-card").classList.toggle("on", isCard);
  $("#payBtn").textContent = m === "pix" ? "Já paguei o PIX – enviar pedido" : "Enviar pedido e receber link do cartão";
  $("#err").textContent = "";
}
document.querySelectorAll("input[name=pay]").forEach(r => r.addEventListener("change", updatePay));

/* Máscaras */
const digits = v => v.replace(/\D/g, "");
$("#tel").addEventListener("input", e => { const v = digits(e.target.value).slice(0, 11);
  e.target.value = v.length > 6 ? `(${v.slice(0,2)}) ${v.slice(2, v.length - 4)}-${v.slice(-4)}` : v.length > 2 ? `(${v.slice(0,2)}) ${v.slice(2)}` : v; });

/* Envio: registra o pedido como "aguardando pagamento". O preparo só começa depois de
   conferir o PIX no app do PicPay (ou o pagamento do link do cartão). */
let lastOrder = null;
$("#form").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target; $("#err").textContent = "";
  if (!f.checkValidity()) { f.reportValidity(); return; }
  if (digits(f.tel.value).length < 10) { $("#err").textContent = "Informe um telefone com DDD."; return; }
  finalizeOrder(f);
});

function finalizeOrder(f) {
  const t = totals(), m = method();
  lastOrder = {
    num: "FL-" + Math.floor(1000 + Math.random() * 9000),
    items: lines().map(l => ({ name: l.p.name, q: l.q, sub: l.p.price * l.q })), t,
    pay: m === "pix" ? "PIX" : "Cartão de crédito (link PicPay)",
    nome: f.nome.value, tel: f.tel.value,
    end: `${f.rua.value}, ${f.num.value} – ${f.bairro.value}` + (f.ref.value ? ` (${f.ref.value})` : "")
  };
  const eta = new Date(Date.now() + 45 * 60000);
  $("#ordNum").textContent = "Pedido " + lastOrder.num;
  $("#okMsg").textContent = m === "pix" ? "Último passo: envie o pedido no WhatsApp junto com o comprovante do PIX." : "Último passo: envie o pedido no WhatsApp e receba o link de pagamento do cartão.";
  $("#eta").textContent = `35 a 45 min (até ${eta.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })})`;
  $("#recap").innerHTML = lastOrder.items.map(i => `<div><span>${i.q}× ${i.name}</span><span>${brl(i.sub)}</span></div>`).join("") +
    `<div><span>Entrega</span><span>${t.fee ? brl(t.fee) : "Grátis"}</span></div>
     <div><b>Total (${lastOrder.pay})</b><b>${brl(t.total)}</b></div>
     <div style="margin-top:.6rem;color:var(--muted)"><span>${lastOrder.end}</span></div>`;
  cart = {}; renderCart();
  $("#stepForm").style.display = "none"; $("#stepOk").style.display = ""; $("#modal").scrollTop = 0;
}

/* Resumo para o WhatsApp da lanchonete */
$("#waBtn").addEventListener("click", () => {
  const o = lastOrder; if (!o) return;
  const txt = [`*Pedido ${o.num} – Flash Lanches*`, "",
    ...o.items.map(i => `${i.q}x ${i.name} – ${brl(i.sub)}`), "",
    `Subtotal: ${brl(o.t.sub)}`, `Entrega: ${o.t.fee ? brl(o.t.fee) : "Grátis"}`, `*Total: ${brl(o.t.total)}*`,
    `Pagamento: ${o.pay} – ${o.pay === "PIX" ? "PIX feito, comprovante em anexo" : "aguardando link de pagamento"}`, "",
    `Cliente: ${o.nome} – ${o.tel}`, `Endereço: ${o.end}`].join("\n");
  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(txt)}`, "_blank", "noopener");
});
$("#newOrder").addEventListener("click", () => { $("#form").reset(); closeModal(); window.scrollTo({ top: 0, behavior: "smooth" }); });

/* Início */
renderMenu(); renderCart();
