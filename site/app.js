// --- دادههای دمو ---
const LISTINGS = [
  {id:1,title:'لوفت مدرن شمiran',loc:'تهران · شمiran',type:'loft',price:420000,rating:4.9,emoji:'🏙️',grad:'linear-gradient(135deg,#6D5DF6,#A78BFA)'},
  {id:2,title:'ویلا باغچهای لوکس',loc:'کرج · عالی قصر',type:'villa',price:780000,rating:4.8,emoji:'🏡',grad:'linear-gradient(135deg,#00C2A8,#4ADE80)'},
  {id:3,title:'آپارتمان مرکزی',loc:'تهران · خیابان ولیعصر',type:'apartment',price:310000,rating:4.7,emoji:'🏢',grad:'linear-gradient(135deg,#F59E0B,#FBBF24)'},
  {id:4,title:'کلبه چوبی جنگلی',loc:'مازندران · رامسر',type:'cabin',price:540000,rating:5.0,emoji:'🌲',grad:'linear-gradient(135deg,#10B981,#059669)'},
  {id:5,title:'لوفت هنری',loc:'تهران · تجریش',type:'loft',price:390000,rating:4.6,emoji:'🎨',grad:'linear-gradient(135deg,#EC4899,#F472B6)'},
  {id:6,title:'ویلا استخر دار',loc:'شیراز · زرگون',type:'villa',price:690000,rating:4.9,emoji:'🏊',grad:'linear-gradient(135deg,#3B82F6,#60A5FA)'},
];

let filter = 'all';
function renderListings(){
  const list = LISTINGS.filter(l=>filter==='all'||l.type===filter);
  document.getElementById('listings').innerHTML = list.map(l=>`
    <div class="card" onclick="openBook(${l.id})">
      <div class="card-img" style="background:${l.grad}">
        <span class="ai-badge">⚡ 가격 AI</span>
        <button class="fav" onclick="event.stopPropagation();fav(event)">♡</button>
        ${l.emoji}
      </div>
      <div class="card-body">
        <div class="card-top"><h3>${l.title}</h3><span class="rating">★ ${l.rating}</span></div>
        <div class="card-loc">📍 ${l.loc}</div>
        <div class="card-foot">
          <div class="price"><b>${l.price.toLocaleString('fa-IR')}</b> <small>تومان / شب</small></div>
          <span class="book-link">رزرو →</span>
        </div>
      </div>
    </div>`).join('');
  document.getElementById('resultLine').textContent = `${list.length} اقامتگاه · قیمتگذاری شده توسط AI`;
}
renderListings();

function fav(e){const b=e.target;b.textContent=b.textContent==='♡'?'♥':'♡';b.style.color='#EC4899'}
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{
  document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
  c.classList.add('active');filter=c.dataset.filter;renderListings();
});
document.querySelectorAll('.stab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.stab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  toast(`حالت «${t.textContent.trim()}» فعال شد — بزودی کاملاً_available میشود`);
});

function doSearch(){
  const dest=document.getElementById('dest').value||'همه جا';
  const ci=document.getElementById('checkin').value, co=document.getElementById('checkout').value;
  const nights=ci&&co?Math.round((new Date(co)-new Date(ci))/86400000):3;
  toast(`🔍 ${nights} شب در ${dest} — ${LISTINGS.length} گزینه پیشنهاد AI`);
  document.getElementById('explore').scrollIntoView({behavior:'smooth'});
}

// --- رزرو ---
function openBook(id){
  const l=LISTINGS.find(x=>x.id===id);
  const ci=document.getElementById('checkin').value, co=document.getElementById('checkout').value;
  const nights=ci&&co?Math.max(1,Math.round((new Date(co)-new Date(ci))/86400000)):3;
  const sub=l.price*nights, fee=Math.round(sub*.05), tax=Math.round(sub*.04);
  document.getElementById('bookBody').innerHTML=`
    <div class="modal-hero" style="background:${l.grad}">${l.emoji}</div>
    <h2>${l.title}</h2>
    <div class="sub">📍 ${l.loc} · ★ ${l.rating}</div>
    <div class="ai-note">🤖 <span>قیمت پیشنهادی AI: <b>${l.price.toLocaleString('fa-IR')}</b> تومان/شب — بر اساس تقاضا و رقبا (اطمینان ۹۱٪)</span></div>
    <div class="price-row"><span>${l.price.toLocaleString('fa-IR')} × ${nights} شب</span><span>${sub.toLocaleString('fa-IR')}</span></div>
    <div class="price-row"><span>کارمزد پلتفرم</span><span>${fee.toLocaleString('fa-IR')}</span></div>
    <div class="price-row"><span>مالیات</span><span>${tax.toLocaleString('fa-IR')}</span></div>
    <div class="price-row total"><span>جمع کل</span><span>${(sub+fee+tax).toLocaleString('fa-IR')} تومان</span></div>
    <div class="form-row" style="margin-top:18px"><label>نام و نام خانوادگی</label><input placeholder="مثال: علی احمدی"></div>
    <div class="form-row"><label>شماره موبایل</label><input placeholder="09xxxxxxxxx" dir="ltr"></div>
    <button class="btn btn-primary" style="width:100%;margin-top:8px" onclick="pay()">پرداخت و رزرو آنی 🔒</button>
    <p style="font-size:11px;color:var(--muted);text-align:center;margin-top:10px">تأیید پرداخت توسط AI انجام میشود · فقط فیشهای مشکوک به اپراتور ارسال میگردد</p>`;
  document.getElementById('bookOverlay').classList.add('open');
}
function closeBook(){document.getElementById('bookOverlay').classList.remove('open')}
function pay(){
  document.getElementById('bookBody').innerHTML=`
    <div class="success">
      <div class="big">✅</div>
      <h2>رزرو شما تأیید شد!</h2>
      <p style="color:var(--muted);margin:10px 0 20px">پرداخت توسط سیستم بهصورت خودکار تأیید گردید (بدون دخالت انسان).</p>
      <div class="ai-note" style="text-align:right">🔑 کد درب: <b>۴۸۲۱</b> · جزئیات به موبایلتان ارسال شد.</div>
      <button class="btn btn-primary" onclick="closeBook()">عالی، بستن</button>
    </div>`;
  toast('🎉 رزرو با موفقیت تأیید شد');
}

// --- میزبان ---
function openHost(){
  document.getElementById('hostBody').innerHTML=`
    <h2>ثبت اقامتگاه در ۳ دقیقه</h2>
    <div class="sub">عکسها و توضیحات را بدهید، AI بقیه را انجام میدهد.</div>
    <div class="form-row"><label>آدرس اقامتگاه</label><input placeholder="مثال: تهران، شمiran، نیاوران"></div>
    <div class="form-row"><label>توضیحات (به qualquer زبان)</label><input placeholder="آپارتمان روشن با بالکن رو به باغ..."></div>
    <div class="form-row"><label>عکسها</label><input type="file" multiple></div>
    <button class="btn btn-primary" style="width:100%" onclick="runHostAI()">🤖 ثبت و تحلیل توسط AI</button>`;
  document.getElementById('hostOverlay').classList.add('open');
}
function closeHost(){document.getElementById('hostOverlay').classList.remove('open')}
function runHostAI(){
  document.getElementById('hostBody').innerHTML=`
    <div class="success">
      <div class="big">🎉</div>
      <h2>اقامتگاه شما منتشر شد!</h2>
      <div class="ai-note" style="text-align:right">
        ✓ عنوان و توضیحات توسط AI نوشته شد<br>
        ✓ مدارک با OCR تأیید گردید (بدون انسان)<br>
        ✓ قیمت پیشنهادی: <b>۴۲۰٬۰۰۰</b> تومان/شب
      </div>
      <p style="color:var(--muted);font-size:13px">از همین لحظه رزروها شروع میشوند، خودکار.</p>
      <button class="btn btn-primary" onclick="closeHost()">بستن</button>
    </div>`;
  toast('🏠 اقامتگاه توسط AI منتشر شد');
}

// --- چت بات ---
let chatOpen=false;
function toggleChat(){chatOpen=!chatOpen;document.getElementById('chatPanel').classList.toggle('open',chatOpen)}
function quick(t){document.getElementById('chatInput').value=t;sendChat()}
function sendChat(){
  const inp=document.getElementById('chatInput'), text=inp.value.trim();if(!text)return;
  const body=document.getElementById('chatBody');
  body.innerHTML+=`<div class="msg user">${text}</div>`;
  inp.value='';body.scrollTop=body.scrollHeight;
  setTimeout(()=>{
    const t=text.toLowerCase();let ans;
    if(t.includes('رزرو')||t.includes('وضعیت')) ans='✅ رزرو شماره K-۱۰۲۴ تأیید شده است. کد درب: ۴۸۲۱. چیز دیگری هست؟';
    else if(t.includes('تاریخ')||t.includes('تغییر')) ans='📅 تاریخ رزروتان را میتوانید تا ۲۴ ساعت قبل تغییر دهید. میخواهید الان تغییر دهم؟';
    else if(t.includes('قیمت')||t.includes('پول')) ans='💰 قیمتگذاری ما توسط AI و بر اساس تقاضا و رقبا انجام میشود. برای اقامتگاه موردنظرتان یک Preis پیشنهادی بهتان نشان میدهم.';
    else if(t.includes('اختلاف')||t.includes('مشکل')||t.includes('شکایت')) ans='🤝 متوجه شدم. این مورد به تیم حل اختلاف ارسال میشود (تنها نقطهای که انسان وارد میشود). لطفاً توضیح دهید.';
    else ans='🤖 من دستیار کیانم. در مورد وضعیت رزرو، تغییر تاریخ، قیمت یا پشتیبانی سؤال بپرسید.';
    body.innerHTML+=`<div class="msg bot">${ans}</div>`;
    body.scrollTop=body.scrollHeight;
  },500);
}

// --- Toast ---
let toastTimer;
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200);
}

// --- زبان ---
let en=false;
document.getElementById('langBtn').onclick=()=>{
  en=!en;
  document.getElementById('langBtn').textContent=en?'FA':'EN';
  toast(en?'Language switched to English (demo)':'زبان به فارسی تغییر یافت');
};
