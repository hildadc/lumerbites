// LumerBites JS
const currency = (n)=> new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR', maximumFractionDigits:0}).format(n);

// Sample products (max 5)
const products = [
  { id:'cookie1', name:'Choco Lava Cookie', price:18000, image:'assets/img/cookie1.svg', desc:'Isi coklat yang meleleh.' },
  { id:'cookie2', name:'Almond Crunch', price:17000, image:'assets/img/cookie2.svg', desc:'Renyaah dengan almond panggang.' },
  { id:'cookie3', name:'Matcha Cream Cookie', price:19000, image:'assets/img/cookie3.svg', desc:'Matcha premium lembut.' },
  { id:'latte1', name:'Mocha Latte', price:24000, image:'assets/img/cookie4.svg', desc:'Kopi mocha balance.' },
  { id:'latte2', name:'Caramel Macchiato', price:26000, image:'assets/img/cookie5.svg', desc:'Manis gurih caramel.' },
];

// LocalStorage helpers
const read = (key, fallback)=> {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch(e){ return fallback; }
};
const write = (key, value)=> localStorage.setItem(key, JSON.stringify(value));

// Cart state
let cart = read('lumer_cart', []);
const saveCart = ()=> write('lumer_cart', cart);

function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item){ item.qty += 1; } else {
    const p = products.find(p=>p.id===id);
    if(!p) return;
    cart.push({ id:p.id, name:p.name, price:p.price, image:p.image, qty:1 });
  }
  saveCart();
  renderCart();
}

function changeQty(id, delta){
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1){
    cart[idx].qty += delta;
    if(cart[idx].qty<=0) cart.splice(idx,1);
    saveCart();
    renderCart();
  }
}

function cartTotal(){
  return cart.reduce((a,b)=> a + b.price * b.qty, 0);
}

function renderCart(){
  const count = cart.reduce((a,b)=> a + b.qty, 0);
  document.getElementById('cartCount').textContent = count;
  const items = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  items.innerHTML = cart.map(c=>`
    <div class="cart-item">
      <img src="${c.image}" alt="${c.name}" width="64" height="64"/>
      <div>
        <h4>${c.name}</h4>
        <div class="muted">${currency(c.price)}</div>
        <div class="qty">
          <button class="btn btn-ghost" onclick="changeQty('${c.id}', -1)">-</button>
          <span>${c.qty}</span>
          <button class="btn btn-ghost" onclick="changeQty('${c.id}', 1)">+</button>
        </div>
      </div>
      <div><strong>${currency(c.price * c.qty)}</strong></div>
    </div>
  `).join('');
  total.textContent = currency(cartTotal());
}

// Slider
let current = 0;
function renderSlides(){
  const wrap = document.getElementById('productSlides');
  wrap.innerHTML = products.map(p=>`
    <article class="slide">
      <div class="media">
        <img src="${p.image}" alt="${p.name}"/>
      </div>
      <div class="info">
        <h3>${p.name}</h3>
        <p class="muted">${p.desc}</p>
        <div class="price">${currency(p.price)}</div>
        <div class="cta-row">
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Tambahkan ke Keranjang</button>
          <button class="btn btn-outline" onclick="buyNow('${p.id}')">Beli Langsung</button>
        </div>
      </div>
    </article>
  `).join('');
  updateSlider();
}

function updateSlider(){
  const slides = document.querySelector('.slides');
  slides.style.transform = `translateX(-${current*100}%)`;
}
function nextSlide(){ current = (current + 1) % products.length; updateSlider(); }
function prevSlide(){ current = (current - 1 + products.length) % products.length; updateSlider(); }

// Checkout (dummy summary + WA link prefilled)
function checkout(){
  if(cart.length===0){ alert('Keranjang masih kosong.'); return; }
  const lines = cart.map(c=>`- ${c.name} x${c.qty} = ${currency(c.price*c.qty)}`).join('%0A');
  const total = currency(cartTotal());
  const msg = `Halo LumerBites, saya ingin order:%0A${lines}%0A%0ATotal: ${total}%0AAlamat: `;
  const wa = `https://wa.me/6281234567890?text=${msg}`;
  window.open(wa, '_blank');
}

// Buy now shortcut
function buyNow(id){
  cart = []; // new order
  saveCart();
  addToCart(id);
  openCart();
}

// Testimonials
let testimonials = read('lumer_testimonials', [
  { name:'Nadia', rating:5, message:'Choco Lava-nya beneran lumer! Packaging rapi, repeat order sih ini.' },
  { name:'Reza', rating:4, message:'Kopi mochanya pas manisnya. Cocok buat nongkrong sore.' },
  { name:'Dewi', rating:5, message:'Almond Crunch favorit anak-anak. Pengiriman cepat.' },
]);

function renderTestimonials(){
  const wrap = document.getElementById('testimonialList');
  wrap.innerHTML = testimonials.map(t=>`
    <div class="testimonial">
      <div class="stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
      <p>${t.message}</p>
      <div class="muted">— ${t.name}</div>
    </div>
  `).join('');
}

function addTestimonial(t){
  testimonials.unshift(t);
  write('lumer_testimonials', testimonials);
  renderTestimonials();
}

// Forms
document.addEventListener('DOMContentLoaded', ()=>{
  // year
  document.getElementById('year').textContent = new Date().getFullYear();
  // slider
  renderSlides();
  document.querySelector('.slider-nav.next').addEventListener('click', nextSlide);
  document.querySelector('.slider-nav.prev').addEventListener('click', prevSlide);
  // cart
  renderCart();
  document.getElementById('cartButton').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('checkoutButton').addEventListener('click', checkout);
  document.getElementById('checkoutTop').addEventListener('click', checkout);
  document.getElementById('checkoutBottom').addEventListener('click', checkout);
  document.getElementById('clearCart').addEventListener('click', ()=>{ cart=[]; saveCart(); renderCart(); });

  // testimonial form
  document.getElementById('testimonialForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const t = {
      name: fd.get('name') || 'Anonim',
      rating: parseInt(fd.get('rating') || '5', 10),
      message: fd.get('message').toString().trim(),
    };
    if(!t.message){ return; }
    addTestimonial(t);
    e.currentTarget.reset();
    alert('Terima kasih untuk testimoninya!');
  });

  // feedback
  document.getElementById('feedbackForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get('name'),
      email: fd.get('email'),
      message: fd.get('message'),
      ts: new Date().toISOString()
    };
    // Simpan lokal
    const inbox = read('lumer_feedback', []);
    inbox.unshift(payload);
    write('lumer_feedback', inbox);
    document.getElementById('feedbackStatus').textContent = 'Terima kasih! Masukan Anda sudah kami terima.';
    e.currentTarget.reset();
  });

  renderTestimonials();
});

function openCart(){ document.getElementById('cartDrawer').classList.add('open'); document.getElementById('cartDrawer').setAttribute('aria-hidden','false'); }
function closeCart(){ document.getElementById('cartDrawer').classList.remove('open'); document.getElementById('cartDrawer').setAttribute('aria-hidden','true'); }
