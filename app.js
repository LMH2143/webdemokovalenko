const products = [
  {id:1,name:'Ботинки из чёрного лака',category:'Ботинки',price:229.95,color:'Чёрный'},
  {id:2,name:'Челси чёрные',category:'Челси',price:229.95,color:'Чёрный'},
  {id:3,name:'Ботинки с пряжкой',category:'Ботинки',price:479.95,color:'Синий'},
  {id:4,name:'Сапоги с двумя пряжками',category:'Сапоги',price:379.95,color:'Чёрный'},
  {id:5,name:'Сапоги с металлическим кольцом',category:'Сапоги',price:259.95,color:'Чёрный'},
  {id:6,name:'Сапоги на шнуровке',category:'Сапоги',price:249.95,color:'Кэмел'},
  {id:7,name:'Сапоги с ремешками',category:'Сапоги',price:269.95,color:'Кэмел'},
  {id:8,name:'Сапоги бежевые на шнуровке',category:'Сапоги',price:239.95,color:'Бежевый'},
  {id:9,name:'Ботильоны на устойчивом каблуке',category:'Ботильоны',price:259.95,color:'Чёрный'},
  {id:10,name:'Ботинки с серебристой молнией',category:'Ботинки',price:249.95,color:'Чёрный'}
].map(p=>({...p,sizes:[35,36,37,38,39,40],folder:`assets/products/${String(p.id).padStart(2,'0')}`}));
const $ = s => document.querySelector(s);
const money = n => n.toLocaleString('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2})+' BYN';
const sku = p => `KOV-${String(p.id).padStart(3,'0')}`;
const angles = ['Вид спереди','Вид сбоку','Вид сзади в три четверти'];
const CART_KEY = 'kovalenko-cart-v1';
let category='Все', current=null, size=null, angle=0, cart=[];
try {
  const saved=JSON.parse(localStorage.getItem(CART_KEY)||'[]');
  if(Array.isArray(saved)) for(const row of saved){
    const p=products.find(p=>p.id===row.id);
    if(!p || !p.sizes.includes(row.size) || !Number.isInteger(row.quantity) || row.quantity<1) continue;
    const existing=cart.find(i=>i.id===row.id && i.size===row.size);
    if(existing) existing.quantity=Math.min(99,existing.quantity+row.quantity);
    else cart.push({id:row.id,size:row.size,quantity:Math.min(99,row.quantity)});
  }
} catch { /* Storage unavailable or invalid: the cart remains usable in memory. */ }
const cartCount=()=>cart.reduce((sum,row)=>sum+row.quantity,0);
const cartTotal=()=>cart.reduce((sum,row)=>sum+Math.round(products.find(p=>p.id===row.id).price*100)*row.quantity,0)/100;
function saveCart(){try{localStorage.setItem(CART_KEY,JSON.stringify(cart));}catch{toast('Корзина сохранена только до закрытия страницы.');}}
const categories=['Все','Сапоги','Ботинки','Полуботинки','Туфли','Кроссовки','Лоферы','Кеды','Босоножки','Сабо','Ботильоны','Угги','Челси','Казаки','Слингбэки','Мюли'];
$('#category-list').innerHTML=categories.map(c=>`<button data-category="${c}" class="${c==='Все'?'active':''}">${c==='Все'?'Вся обувь':c}</button>`).join('');
function render(){
  let list=products.filter(p=>(category==='Все'||p.category===category)&&`${p.name} ${sku(p)} ${p.color}`.toLowerCase().includes($('#search').value.toLowerCase().trim()));
  if($('#sort').value==='low')list.sort((a,b)=>a.price-b.price);
  if($('#sort').value==='high')list.sort((a,b)=>b.price-a.price);
  $('#products').innerHTML=list.map(p=>`<article class="product"><span class="new">new</span><button class="product-open" data-product="${p.id}" aria-label="Открыть ${p.name}"><img class="photo" src="${p.folder}/2.webp" alt="${p.name}, ${p.color}" loading="lazy" width="640" height="640"><h2>${p.name}</h2></button><div class="price-row"><strong>${money(p.price)}</strong><button class="bag" data-product="${p.id}" aria-label="Выбрать размер: ${p.name}"><img src="assets/bag.png" alt=""></button></div><div class="sizes-preview">${p.sizes.join('　')}</div><span class="views-label">3 ракурса</span></article>`).join('');
  $('#empty').hidden=!!list.length;
  $('#category-title').textContent=category==='Все'?'Вся обувь':category;
  document.querySelectorAll('#category-list button').forEach(b=>b.classList.toggle('active',b.dataset.category===category));
}
function openProduct(id){
  current=products.find(p=>p.id===id);if(!current)return;
  size=null;angle=1;const p=current;
  $('#product-content').innerHTML=`<div class="gallery"><div class="muted">new　 Артикул: ${sku(p)}</div><div class="gallery-stage"><button id="zoom-image" class="image-zoom" aria-label="Увеличить фотографию"><img id="detail-image" class="detail-image" src="${p.folder}/2.webp" alt="${p.name}: ${angles[1]}"></button><button class="gallery-prev" data-angle-step="-1" aria-label="Предыдущий ракурс">‹</button><button class="gallery-next" data-angle-step="1" aria-label="Следующий ракурс">›</button><span id="angle-count" aria-live="polite">2 / 3</span></div><div class="gallery-thumbnails" role="group" aria-label="Ракурсы модели">${angles.map((label,i)=>`<button data-angle="${i}" aria-label="${label}" aria-pressed="${i===1}" class="${i===1?'selected':''}"><img src="${p.folder}/${i+1}.webp" alt="${label}" loading="lazy"></button>`).join('')}</div><p class="muted">Нажмите на фото, чтобы увеличить</p></div><div class="detail"><h2 id="product-title">${p.name}</h2><p class="price">${money(p.price)}</p><p class="notice">Демонстрационный товар<br>Цена и наличие предварительные</p><p class="stock">Выберите размер · размеры для демонстрации</p><div class="size-options" role="group" aria-label="Размер обуви">${p.sizes.map(n=>`<button data-size="${n}" aria-label="Размер ${n}" aria-pressed="false">${n}</button>`).join('')}</div><span class="color-chip">${p.color}</span><button class="primary" id="add-cart">Выберите размер</button><button class="secondary" id="store-availability">НАЛИЧИЕ В МАГАЗИНАХ</button><p id="size-message" class="muted" role="status"></p><dl class="specs"><div><dt>Пол</dt><dd>для женщин</dd></div><div><dt>Тип обуви</dt><dd>${p.category}</dd></div><div><dt>Цвет</dt><dd>${p.color}</dd></div><div><dt>Коллекция</dt><dd>Демо 2026</dd></div></dl><p class="muted">Реальные размеры, цены и наличие будут подтверждены магазином.</p></div>`;
  $('#product-dialog').showModal();
  $('#recent-items').innerHTML=`<button data-product="${p.id}"><img src="${p.folder}/2.webp" alt="${p.name}"><span>${p.name}<br><br>${money(p.price)}</span></button>`;
}
function setAngle(next){
  angle=(next+3)%3;
  $('#detail-image').src=`${current.folder}/${angle+1}.webp`;
  $('#detail-image').alt=`${current.name}: ${angles[angle]}`;
  $('#angle-count').textContent=`${angle+1} / 3`;
  document.querySelectorAll('[data-angle]').forEach(b=>{const selected=Number(b.dataset.angle)===angle;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));});
}
function info(title,text){$('#info-title').textContent=title;$('#info-text').textContent=text;$('#info-dialog').showModal();}
function renderCart(){
  $('#count').textContent=cartCount();
  $('#cart-open').setAttribute('aria-label',`Корзина: ${cartCount()}`);
  $('#cart-items').innerHTML=cart.length?cart.map((row,i)=>{
    const p=products.find(p=>p.id===row.id);
    return `<article><img src="${p.folder}/2.webp" alt="${p.name}"><div>${p.name}<br><span class="muted">${sku(p)} · Размер: ${row.size} · ${p.color}</span><br><strong>${money(p.price*row.quantity)}</strong><div class="quantity-control" role="group" aria-label="Количество: ${p.name}, размер ${row.size}"><button data-quantity="${i}" data-delta="-1" aria-label="Уменьшить количество" ${row.quantity===1?'disabled':''}>−</button><span aria-live="polite">${row.quantity}</span><button data-quantity="${i}" data-delta="1" aria-label="Увеличить количество" ${row.quantity===99?'disabled':''}>+</button></div></div><button data-remove="${i}" aria-label="Удалить ${p.name}, размер ${row.size}">Удалить</button></article>`;
  }).join(''):'<p class="muted">Корзина пока пуста. Выберите модель и размер в каталоге.</p>';
  $('#cart-total').textContent=cart.length?'Итого: '+money(cartTotal()):'';
  $('#checkout').disabled=!cart.length;
}
function renderOrder(){
  $('#order-summary').innerHTML=cart.map(row=>{const p=products.find(p=>p.id===row.id);return `<div class="order-line"><img src="${p.folder}/2.webp" alt=""><div>${p.name}<br><span class="muted">${sku(p)} · Размер ${row.size} · ${row.quantity} шт.</span></div><strong>${money(p.price*row.quantity)}</strong></div>`;}).join('')+`<p class="order-total">Товаров: ${cartCount()} · Итого: ${money(cartTotal())}</p>`;
}
let toastTimer;
function toast(t){$('#toast').textContent=t;$('#toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').style.display='none',2500);}
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-category]');if(c){const left=window.scrollX,top=window.scrollY;category=c.dataset.category;render();window.scrollTo({left,top,behavior:'instant'});}
  const p=e.target.closest('[data-product]');if(p){if($('#product-dialog').open)$('#product-dialog').close();openProduct(Number(p.dataset.product));}
  const a=e.target.closest('[data-angle]');if(a)setAngle(Number(a.dataset.angle));
  const step=e.target.closest('[data-angle-step]');if(step)setAngle(angle+Number(step.dataset.angleStep));
  if(e.target.closest('#zoom-image')){$('#zoom-photo').src=$('#detail-image').src;$('#zoom-photo').alt=$('#detail-image').alt;$('#zoom-dialog').showModal();}
  const s=e.target.closest('[data-size]');if(s){size=Number(s.dataset.size);document.querySelectorAll('[data-size]').forEach(b=>{b.classList.toggle('selected',b===s);b.setAttribute('aria-pressed',String(b===s));});$('#add-cart').textContent='Добавить в корзину';$('#size-message').textContent='';}
  if(e.target.closest('#add-cart')){
    if(!size){$('#size-message').textContent='Пожалуйста, выберите размер.';return;}
    const row=cart.find(i=>i.id===current.id&&i.size===size);
    if(row?.quantity===99){toast('Максимум 99 пар одного размера.');return;}
    if(row)row.quantity++;else cart.push({id:current.id,size,quantity:1});
    saveCart();renderCart();$('#product-dialog').close();toast(`Добавлено в корзину · Размер ${size}`);
  }
  if(e.target.closest('#store-availability'))info('Наличие в магазинах','Демо-версия. Реальное наличие размеров по магазинам пока не подключено.');
  const r=e.target.closest('[data-remove]');if(r){cart.splice(Number(r.dataset.remove),1);saveCart();renderCart();}
  const q=e.target.closest('[data-quantity]');if(q){const row=cart[Number(q.dataset.quantity)];row.quantity=Math.max(1,Math.min(99,row.quantity+Number(q.dataset.delta)));saveCart();renderCart();}
  if(e.target.closest('[data-close]'))e.target.closest('dialog').close();
});
$('#product-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setAngle(angle+(e.key==='ArrowRight'?1:-1));}});
$('#cart-open').onclick=()=>{renderCart();$('#cart-dialog').showModal();};
$('#checkout').onclick=()=>{if(!cart.length)return;$('#cart-dialog').close();renderOrder();$('#checkout-dialog').showModal();};
$('#back-to-cart').onclick=()=>{$('#checkout-dialog').close();renderCart();$('#cart-dialog').showModal();};
$('#sort').onchange=render;$('#search').oninput=render;
$('#search-toggle').onclick=()=>{$('#search-bar').hidden=!$('#search-bar').hidden;if(!$('#search-bar').hidden)$('#search').focus();};
$('#menu').onclick=()=>{if(window.innerWidth<=800)$('#categories').classList.toggle('visible');else $('#categories').scrollIntoView({behavior:'smooth'});};
$('#account').onclick=()=>info('Личный кабинет','В демо-версии регистрация и личный кабинет пока не подключены.');
$('#about').onclick=()=>info('KOVALENKO','СООО «Фабрика обуви Коваленко». Обувь на каждый день.');
$('#delivery').onclick=()=>info('Доставка и оплата','Это демо-версия. Платёжная система не настроена. Условия, стоимость и сроки доставки будут добавлены позже.');
$('#returns').onclick=()=>info('Обмен и возврат','Условия обмена и возврата будут добавлены после подтверждения информации магазина.');
$('#contacts').onclick=()=>info('Контакты','+375-336-644-600 · marketing@kovalenko.by · СООО «Фабрика обуви Коваленко», г. Могилёв, ул. Франко 10.');
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
render();renderCart();

// Open a specific model from links shared by the virtual consultant.
function openLinkedProduct() {
  const code = new URLSearchParams(window.location.search).get('product');
  if (!code) return;
  const product = products.find(p => sku(p) === code.toUpperCase());
  if (product) openProduct(product.id);
}
openLinkedProduct();
