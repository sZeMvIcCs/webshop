(function(){
const CART_KEY="barca_store_cart_v1";

function loadCart(){
try{
const raw=localStorage.getItem(CART_KEY);
const parsed=raw ? JSON.parse(raw) : [];
return Array.isArray(parsed) ? parsed : [];
}catch(e){
return [];
}
}

function saveCart(cart){
localStorage.setItem(CART_KEY,JSON.stringify(cart));
}

function formatPrice(value){
return new Intl.NumberFormat("hu-HU").format(value)+" Ft";
}

function getCount(cart){
return cart.reduce((sum,item)=>sum+(item.qty||0),0);
}

function getSubtotal(cart){
return cart.reduce((sum,item)=>sum+((item.price||0)*(item.qty||0)),0);
}

function ensureDrawer(){
if(document.getElementById("cartsysDrawer")) return;
const backdrop=document.createElement("div");
backdrop.id="cartsysBackdrop";
backdrop.className="cartsys-backdrop";

const drawer=document.createElement("aside");
drawer.id="cartsysDrawer";
drawer.className="cartsys-drawer";
drawer.innerHTML='\
<div class="cartsys-head">\
<h3>Kosaram</h3>\
<button class="cartsys-close" type="button" aria-label="Bezárás">&times;</button>\
</div>\
<div class="cartsys-items" id="cartsysItems"></div>\
<div class="cartsys-foot">\
<div class="cartsys-subtotal"><span>Részösszeg</span><span id="cartsysSubtotal">0 Ft</span></div>\
<div class="cartsys-note">Az árak tartalmazzák az áfát. A szállítás a pénztárnál kerül kiszámításra.</div>\
<button class="cartsys-pay" type="button" id="cartsysPayBtn">FIZETÉS FOLYTATÁSA - 0 Ft</button>\
</div>';

backdrop.addEventListener("click",closeDrawer);
drawer.querySelector(".cartsys-close").addEventListener("click",closeDrawer);

(document.body || document.documentElement).appendChild(backdrop);
(document.body || document.documentElement).appendChild(drawer);
}

function openDrawer(){
ensureDrawer();
renderCart();
document.getElementById("cartsysBackdrop").classList.add("open");
document.getElementById("cartsysDrawer").classList.add("open");
}

function closeDrawer(){
const backdrop=document.getElementById("cartsysBackdrop");
const drawer=document.getElementById("cartsysDrawer");
if(backdrop) backdrop.classList.remove("open");
if(drawer) drawer.classList.remove("open");
}

function updateBadges(){
const count=getCount(loadCart());
document.querySelectorAll(".cart-count").forEach((badge)=>{
badge.textContent=String(count);
});
}

function renderCart(){
ensureDrawer();
const cart=loadCart();
const itemsEl=document.getElementById("cartsysItems");
const subtotal=getSubtotal(cart);

if(!cart.length){
itemsEl.innerHTML='<div class="cartsys-empty">A kosár jelenleg üres.</div>';
}else{
itemsEl.innerHTML=cart.map((item,index)=>{
const details=item.details ? '<div class="cartsys-meta">'+item.details+'</div>' : "";
const image=item.image || "img/product1.webp";
return '\
<div class="cartsys-item" data-index="'+index+'">\
<img src="'+image+'" alt="'+item.name+'">\
<div>\
<div class="cartsys-name">'+item.name+'</div>'+details+'\
<div class="cartsys-row">\
<div class="cartsys-price">'+formatPrice(item.price)+'</div>\
<div class="cartsys-qty">\
<button type="button" data-action="dec">-</button>\
<span>'+(item.qty||1)+'</span>\
<button type="button" data-action="inc">+</button>\
</div>\
</div>\
<div class="cartsys-row">\
<span></span>\
<button class="cartsys-remove" type="button" data-action="remove">Törlés</button>\
</div>\
</div>\
</div>';
}).join("");
}

const subtotalText=formatPrice(subtotal);
document.getElementById("cartsysSubtotal").textContent=subtotalText;
document.getElementById("cartsysPayBtn").textContent="FIZETÉS FOLYTATÁSA - "+subtotalText;
document.getElementById("cartsysPayBtn").onclick=()=>{
window.location.href="penztar.html";
};

itemsEl.querySelectorAll("[data-action]").forEach((btn)=>{
btn.addEventListener("click",()=>{
const row=btn.closest(".cartsys-item");
const idx=Number(row.getAttribute("data-index"));
const action=btn.getAttribute("data-action");
const updated=loadCart();
if(!updated[idx]) return;
if(action==="inc") updated[idx].qty+=1;
if(action==="dec") updated[idx].qty=Math.max(1,updated[idx].qty-1);
if(action==="remove") updated.splice(idx,1);
saveCart(updated);
updateBadges();
renderCart();
});
});
}

function collectDetails(btn){
const pane=btn.closest(".info-pane") || document;
const details=[];
const size=pane.querySelector(".size.active");
if(size) details.push("Méret: "+size.textContent.trim());
const customMode=pane.querySelector("#customModeBtn.active");
const playerSelect=pane.querySelector("#playerSelect");
const customInput=pane.querySelector("#customNameInput");
if(customMode && customInput && customInput.value.trim()){
details.push("Név: "+customInput.value.trim());
}else if(playerSelect && playerSelect.value){
details.push("Név: "+playerSelect.value.trim());
}
const badge=pane.querySelector(".badge-option.active");
if(badge) details.push("Jelvény: "+badge.textContent.trim());
return details.join(" | ");
}

function addItem(item){
const cart=loadCart();
const key=item.id+"::"+(item.details || "");
const existing=cart.find((x)=>(x.id+"::"+(x.details || ""))===key);
if(existing){
existing.qty+=1;
}else{
cart.push({
id:item.id,
name:item.name,
price:Number(item.price)||0,
image:item.image || "",
details:item.details || "",
qty:1
});
}
saveCart(cart);
updateBadges();
openDrawer();
}

function animateProducts(selector){
const nodes=[...document.querySelectorAll(selector || ".product")];
nodes.forEach((node,index)=>{
node.classList.remove("page-product-reveal");
node.style.animationDelay=(Math.min(index,20)*45)+"ms";
// Force reflow so animation can replay after dynamic re-render.
void node.offsetWidth;
node.classList.add("page-product-reveal");
});
}

function ensureSearchUi(){
const navbar=document.querySelector(".navbar");
if(!navbar){
return;
}

function ensureChatbotUi(){
if(document.getElementById("aiChatPanel")){
return;
}

const navbar=document.querySelector(".navbar");
if(!navbar){
return;
}

const escapeHtml=(text)=>String(text || "")
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/\"/g,"&quot;")
.replace(/'/g,"&#39;");

const normalize=(value)=>String(value || "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();

const collectProducts=()=>{
const found=[];
const seen=new Set();
const add=(id,name)=>{
if(!id || !name){
return;
}
const key=id+"|"+normalize(name);
if(seen.has(key)){
return;
}
seen.add(key);
found.push({id,name});
};

try{
if(typeof products!=="undefined" && Array.isArray(products)){
products.forEach((p)=>add(p.id,p.name));
}
}catch(e){
// Nincs minden oldalon products tömb.
}

document.querySelectorAll('a.product-link[href*="termek.html?id="]').forEach((a)=>{
const href=a.getAttribute("href") || "";
const idMatch=href.match(/[?&]id=([^&]+)/);
const id=idMatch ? decodeURIComponent(idMatch[1]) : "";
const nameEl=a.querySelector(".product-info p");
const name=nameEl ? nameEl.textContent.trim() : "";
add(id,name);
});

document.querySelectorAll("[data-product-id][data-product-name]").forEach((el)=>{
add((el.getAttribute("data-product-id") || "").trim(),(el.getAttribute("data-product-name") || "").trim());
});

return found;
};

const productPool=collectProducts();

const toggle=document.createElement("button");
toggle.type="button";
toggle.className="ai-chat-toggle";
toggle.id="aiChatToggle";
toggle.innerHTML="&#129302; AI Chat";
toggle.setAttribute("title","AI Chat");

const panel=document.createElement("section");
panel.className="ai-chat-panel";
panel.id="aiChatPanel";
panel.innerHTML='\
<div class="ai-chat-head">\
<strong>AI Asszisztens</strong>\
<button class="ai-chat-close" type="button" aria-label="Bezárás">&times;</button>\
</div>\
<div class="ai-chat-body" id="aiChatBody"></div>\
<form class="ai-chat-form" id="aiChatForm">\
<input class="ai-chat-input" id="aiChatInput" type="text" placeholder="Kérdezz pl.: hazai mez, szállítás, fizetés" autocomplete="off">\
<button class="ai-chat-send" type="submit">Küldés</button>\
</form>';

(document.body || document.documentElement).appendChild(toggle);
(document.body || document.documentElement).appendChild(panel);

const body=panel.querySelector("#aiChatBody");
const input=panel.querySelector("#aiChatInput");
const form=panel.querySelector("#aiChatForm");
const closeBtn=panel.querySelector(".ai-chat-close");

const ROOT_OPTIONS=["Szállítási információ","Fizetési lehetőségek","Milyen méretet válasszak?","Mutass hazai mezeket","Mutass pólókat"];

const FOLLOW_OPTIONS={
szallitas:["Mennyi idő a szállítás?","Mennyibe kerül a szállítás?","Fizetési lehetőségek","Mutass hazai mezeket"],
fizetes:["Lehet kártyával fizetni?","Hol fizetek a rendelésnél?","Szállítási információ","Mutass pólókat"],
meret:["Hol tudok méretet választani?","Mutass hazai mezeket","Mutass pólókat","Szállítási információ"],
termek:["Mutass hazai mezeket","Mutass pólókat","Milyen méretet válasszak?","Fizetési lehetőségek"],
default:ROOT_OPTIONS
};

const appendMessage=(role,html)=>{
if(!body){
return;
}
const msg=document.createElement("div");
msg.className="ai-chat-msg "+role;
msg.innerHTML=html;
body.appendChild(msg);
body.scrollTop=body.scrollHeight;
};

const appendOptions=(options)=>{
if(!body || !Array.isArray(options) || !options.length){
return;
}
const wrap=document.createElement("div");
wrap.className="ai-chat-options";
wrap.innerHTML=options.map((q)=>'<button type="button" data-q="'+escapeHtml(q)+'">'+escapeHtml(q)+"</button>").join("");
body.appendChild(wrap);
body.scrollTop=body.scrollHeight;
};

const findProducts=(question)=>{
const q=normalize(question);
if(!q || !productPool.length){
return [];
}
return productPool
.map((p)=>({
...p,
score:normalize(p.name).includes(q) ? 2 : q.split(/\s+/).some((w)=>w && normalize(p.name).includes(w)) ? 1 : 0
}))
.filter((p)=>p.score>0)
.sort((a,b)=>b.score-a.score)
.slice(0,3);
};

const answer=(question)=>{
const q=normalize(question);
if(!q){
return {
text:"Írj be egy kérdést, és segítek terméket találni vagy eligazodni a vásárlásban.",
options:FOLLOW_OPTIONS.default
};
}

if(/lehet.*kartya|kartyaval|bankkartya|kartya.*fizet/.test(q)){
return {
text:"Igen, bankkártyás fizetés támogatott. A kosárban a `FIZETÉS FOLYTATÁSA` gomb után tudod kiválasztani.",
options:FOLLOW_OPTIONS.fizetes
};
}

if(/hol.*fizet|rendelesnel.*fizet|penztarnal.*fizet/.test(q)){
return {
text:"A fizetés a pénztár oldalon történik. Nyisd meg a kosarat, majd kattints a `FIZETÉS FOLYTATÁSA` gombra.",
options:FOLLOW_OPTIONS.fizetes
};
}

if(/mennyi.*ido.*szallitas|hany.*nap|mikor.*erkezik/.test(q)){
return {
text:"A szállítás általában 1-3 munkanap, de a pontos időt a pénztárban és a visszaigazolásban látod.",
options:FOLLOW_OPTIONS.szallitas
};
}

if(/mennyibe.*kerul.*szallitas|szallitasi.*dij/.test(q)){
return {
text:"A szállítás díja a pénztár oldalon jelenik meg a cím és szállítási mód alapján.",
options:FOLLOW_OPTIONS.szallitas
};
}

if(/hol.*meret|meretet.*valaszt/.test(q)){
return {
text:"A méretválasztás a termékoldalon (`termek.html`) érhető el, közvetlenül a termék adatai mellett.",
options:FOLLOW_OPTIONS.meret
};
}

if(/szallitas|szallit|kiszallit/.test(q)){
return {
text:"A szállítási információkat a pénztárnál látod pontosan. A rendelés leadása után visszaigazoló üzenetet kapsz.",
options:FOLLOW_OPTIONS.szallitas
};
}
if(/fizetes|fizet|kartya|utanvet/.test(q)){
return {
text:"Fizetéshez nyisd meg a kosarat, majd kattints a `FIZETÉS FOLYTATÁSA` gombra. Ott tudod megadni a szükséges adatokat.",
options:FOLLOW_OPTIONS.fizetes
};
}
if(/meret|meretek|size/.test(q)){
return {
text:"A termékoldalon (`termek.html`) választható méreteket találsz. Ha írsz konkrét terméket, ajánlok megfelelőt.",
options:FOLLOW_OPTIONS.meret
};
}

const hits=findProducts(question);
if(hits.length){
return {
text:"Találtam néhány kapcsolódó terméket:<br>"+hits.map((p)=>'<a href="termek.html?id='+encodeURIComponent(p.id)+'">'+escapeHtml(p.name)+"</a>").join("<br>"),
options:FOLLOW_OPTIONS.termek
};
}

return {
text:"Erre most nem találtam pontos terméket. Próbáld konkrétabban, pl.: `hazai mez`, `póló`, `melegítő`, `Yamal`.",
options:FOLLOW_OPTIONS.default
};
};

appendMessage("bot","Szia! AI asszisztens vagyok. Segítek terméket keresni és gyors kérdésekben.");
appendOptions(ROOT_OPTIONS);

const ask=(text)=>{
if(!text){
return;
}
appendMessage("user",escapeHtml(text));
const reply=answer(text);
appendMessage("bot",reply.text);
appendOptions(reply.options);
};

toggle.addEventListener("click",(event)=>{
panel.classList.toggle("open");
if(panel.classList.contains("open") && input){
input.focus();
}
});

if(closeBtn){
closeBtn.addEventListener("click",()=>{
panel.classList.remove("open");
});
}

if(form && input){
form.addEventListener("submit",(event)=>{
event.preventDefault();
const text=input.value.trim();
if(!text){
return;
}
ask(text);
input.value="";
});
}

if(body){
body.addEventListener("click",(event)=>{
const btn=event.target.closest(".ai-chat-options button[data-q]");
if(!btn){
return;
}
const question=btn.getAttribute("data-q") || "";
ask(question);
if(input){
input.focus();
}
});
}
}

let navActions=navbar.querySelector(".nav-actions");
if(!navActions){
navActions=document.createElement("div");
navActions.className="nav-actions";
navbar.appendChild(navActions);
}

if(!navActions.querySelector(".search-toggle")){
const searchBtn=document.createElement("button");
searchBtn.type="button";
searchBtn.className="search-toggle";
searchBtn.setAttribute("aria-label","Keresés");
searchBtn.setAttribute("title","Keresés");
searchBtn.innerHTML="&#128269;";
navActions.insertBefore(searchBtn,navActions.firstChild);
}

if(document.getElementById("siteSearchOverlay")){
return;
}

const overlay=document.createElement("div");
overlay.id="siteSearchOverlay";
overlay.className="site-search-overlay";
overlay.innerHTML='\
<div class="site-search-panel">\
<form class="site-search-form" id="siteSearchForm">\
<input id="siteSearchInput" class="site-search-input" type="search" placeholder="Keresés terméknévre" autocomplete="off">\
<button class="site-search-submit" type="submit">Keresés</button>\
<button class="site-search-close" type="button" id="siteSearchClose">Mégse</button>\
<div id="siteSearchSuggestions" class="site-search-suggestions"></div>\
</form>\
</div>';

(document.body || document.documentElement).appendChild(overlay);

const input=document.getElementById("siteSearchInput");
const suggestionsBox=document.getElementById("siteSearchSuggestions");

function normalizeText(value){
return String(value || "")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toLowerCase();
}

function buildSuggestionPool(){
const items=[];
const seen=new Set();

const add=(id,label)=>{
const key=(id || "")+"|"+normalizeText(label);
if(!id || !label || seen.has(key)){
return;
}
seen.add(key);
items.push({id,label});
};

try{
if(typeof products!=="undefined" && Array.isArray(products)){
products.forEach((product)=>{
add(product.id,product.name);
});
}
}catch(e){
// Oldalspecifikusan nincs mindig products tömb.
}

document.querySelectorAll('a.product-link[href*="termek.html?id="]').forEach((a)=>{
const href=a.getAttribute("href") || "";
const idMatch=href.match(/[?&]id=([^&]+)/);
const id=idMatch ? decodeURIComponent(idMatch[1]) : "";
const nameEl=a.querySelector(".product-info p");
const label=nameEl ? nameEl.textContent.trim() : "";
add(id,label);
});

document.querySelectorAll("[data-product-id][data-product-name]").forEach((el)=>{
const id=(el.getAttribute("data-product-id") || "").trim();
const label=(el.getAttribute("data-product-name") || "").trim();
add(id,label);
});

return items;
}

const suggestionPool=buildSuggestionPool();

function renderSuggestions(term){
if(!suggestionsBox){
return;
}
const q=normalizeText(term);
if(!q){
suggestionsBox.innerHTML="";
suggestionsBox.classList.remove("open");
return;
}

const matches=suggestionPool
.filter((item)=>normalizeText(item.label).includes(q))
.slice(0,10);

if(!matches.length){
suggestionsBox.innerHTML='<button type="button" class="site-search-suggestion" disabled>Nincs közvetlen termék találat</button>';
suggestionsBox.classList.add("open");
return;
}

suggestionsBox.innerHTML=matches.map((item)=>{
const escapedLabel=item.label.replace(/"/g,"&quot;");
const escapedId=(item.id || "").replace(/"/g,"&quot;");
return '<button type="button" class="site-search-suggestion" data-id="'+escapedId+'" data-value="'+escapedLabel+'">'+escapedLabel+'<small>Termék</small></button>';
}).join("");
suggestionsBox.classList.add("open");
}

const openSearch=()=>{
overlay.classList.add("open");
if(input){
const params=new URLSearchParams(window.location.search);
input.value=params.get("kereses") || "";
input.focus();
input.select();
renderSuggestions(input.value);
}
};

const closeSearch=()=>{
overlay.classList.remove("open");
if(suggestionsBox){
suggestionsBox.classList.remove("open");
}
};

if(input){
input.addEventListener("input",()=>{
renderSuggestions(input.value);
});

input.addEventListener("focus",()=>{
renderSuggestions(input.value);
});
}

if(suggestionsBox){
suggestionsBox.addEventListener("click",(event)=>{
const btn=event.target.closest(".site-search-suggestion");
if(!btn){
return;
}
if(btn.hasAttribute("disabled")){
return;
}
const productId=btn.getAttribute("data-id") || "";
const value=btn.getAttribute("data-value") || "";
if(productId){
window.location.href="termek.html?id="+encodeURIComponent(productId);
return;
}
if(input){
input.value=value;
}
const searchUrl=value
? "legnepszerubb.html?kereses="+encodeURIComponent(value)
: "legnepszerubb.html";
window.location.href=searchUrl;
});
}

document.querySelectorAll(".search-toggle").forEach((btn)=>{
btn.addEventListener("click",openSearch);
});

overlay.addEventListener("click",(event)=>{
if(event.target===overlay){
closeSearch();
}
});

const closeBtn=document.getElementById("siteSearchClose");
if(closeBtn){
closeBtn.addEventListener("click",closeSearch);
}

const form=document.getElementById("siteSearchForm");
if(form){
form.addEventListener("submit",(event)=>{
event.preventDefault();
const value=input ? input.value.trim() : "";
const direct=suggestionPool.find((item)=>normalizeText(item.label)===normalizeText(value));
if(direct && direct.id){
window.location.href="termek.html?id="+encodeURIComponent(direct.id);
return;
}
const url=value
? "legnepszerubb.html?kereses="+encodeURIComponent(value)
: "legnepszerubb.html";
window.location.href=url;
});
}

document.addEventListener("keydown",(event)=>{
if(event.key==="Escape" && overlay.classList.contains("open")){
closeSearch();
}
});

ensureChatbotUi();
}

function initMezekDropdown(){
const mezekItems=[...document.querySelectorAll(".has-dropdown")];

if(!mezekItems.length){
return;
}

const closeAll=()=>{
mezekItems.forEach((item)=>item.classList.remove("open"));
};

mezekItems.forEach((item)=>{
let closeTimer=null;
const clearCloseTimer=()=>{
if(closeTimer){
clearTimeout(closeTimer);
closeTimer=null;
}
};

item.addEventListener("mouseenter",()=>{
clearCloseTimer();
closeAll();
item.classList.add("open");
});

item.addEventListener("mouseleave",(event)=>{
const nextTarget=event.relatedTarget;
if(nextTarget && item.contains(nextTarget)){
return;
}
clearCloseTimer();
closeTimer=setTimeout(()=>{
item.classList.remove("open");
},120);
});

item.addEventListener("focusin",()=>{
clearCloseTimer();
closeAll();
item.classList.add("open");
});

item.addEventListener("focusout",(event)=>{
if(!item.contains(event.relatedTarget)){
clearCloseTimer();
closeTimer=setTimeout(()=>{
item.classList.remove("open");
},120);
}
});

const dropdown=item.querySelector(".menu-dropdown");
if(dropdown){
dropdown.addEventListener("mouseenter",clearCloseTimer);
dropdown.addEventListener("mouseleave",()=>{
clearCloseTimer();
closeTimer=setTimeout(()=>{
item.classList.remove("open");
},120);
});
}
});

document.addEventListener("click",(event)=>{
if(!event.target.closest(".has-dropdown")){
closeAll();
}
});
}

document.addEventListener("click",(event)=>{
const toggle=event.target.closest(".cart-toggle");
if(toggle){
event.preventDefault();
openDrawer();
return;
}

const addBtn=event.target.closest("[data-add-to-cart]");
if(addBtn){
event.preventDefault();
addItem({
id:addBtn.getAttribute("data-product-id") || "termek",
name:addBtn.getAttribute("data-product-name") || "Termék",
price:addBtn.getAttribute("data-product-price") || 0,
image:addBtn.getAttribute("data-product-image") || "",
details:collectDetails(addBtn)
});
}
});

window.CartSystem={
open:openDrawer,
close:closeDrawer,
addItem:addItem,
render:renderCart,
animateProducts:animateProducts
};

if(document.readyState==="loading"){
document.addEventListener("DOMContentLoaded",()=>{
updateBadges();
initMezekDropdown();
ensureSearchUi();
animateProducts(".product");
});
}else{
updateBadges();
initMezekDropdown();
ensureSearchUi();
animateProducts(".product");
}
})();