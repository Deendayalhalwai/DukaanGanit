// Service Worker Registration for PWA / App conversion
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Year update
document.getElementById('year').textContent = new Date().getFullYear();

// Tabs switching logic
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.add('hidden'));
    
    tab.classList.add('active');
    const target = document.getElementById(tab.dataset.tab);
    if(target) target.classList.remove('hidden');
  });
});

// Profit Calculator
const buyInput = document.getElementById('buy');
const sellInput = document.getElementById('sell');
const qtyInput = document.getElementById('qty');
const profitOut = document.getElementById('profitOut');

function calcProfit() {
  const buy = parseFloat(buyInput.value) || 0;
  const sell = parseFloat(sellInput.value) || 0;
  const qty = parseFloat(qtyInput.value) || 0;
  const profit = (sell - buy) * qty;
  profitOut.textContent = `₹${profit.toLocaleString('en-IN')}`;
}
[buyInput, sellInput, qtyInput].forEach(inp => inp.addEventListener('input', calcProfit));

// Margin Calculator
const mBuy = document.getElementById('mBuy');
const mSell = document.getElementById('mSell');
const marginOut = document.getElementById('marginOut');

function calcMargin() {
  const b = parseFloat(mBuy.value) || 0;
  const s = parseFloat(mSell.value) || 0;
  if(b > 0) {
    const margin = ((s - b) / b) * 100;
    marginOut.textContent = `${margin.toFixed(1)}%`;
  } else {
    marginOut.textContent = `0%`;
  }
}
[mBuy, mSell].forEach(inp => inp.addEventListener('input', calcMargin));

// Discount Calculator
const price = document.getElementById('price');
const discountRate = document.getElementById('discountRate');
const discountOut = document.getElementById('discountOut');

function calcDiscount() {
  const p = parseFloat(price.value) || 0;
  const d = parseFloat(discountRate.value) || 0;
  const finalPrice = p - (p * d / 100);
  discountOut.textContent = `₹${finalPrice.toLocaleString('en-IN')}`;
}
[price, discountRate].forEach(inp => inp.addEventListener('input', calcDiscount));

// Udhaar Calculator
const credit = document.getElementById('credit');
const paid = document.getElementById('paid');
const udhaarOut = document.getElementById('udhaarOut');

function calcUdhaar() {
  const c = parseFloat(credit.value) || 0;
  const p = parseFloat(paid.value) || 0;
  const rem = c - p;
  udhaarOut.textContent = `₹${rem.toLocaleString('en-IN')}`;
}
[credit, paid].forEach(inp => inp.addEventListener('input', calcUdhaar));

// Customer Khata & WhatsApp Share System
const saveKhataBtn = document.getElementById('saveKhataBtn');
const khataList = document.getElementById('khataList');
const totalKhataOut = document.getElementById('totalKhataOut');

let savedKhata = JSON.parse(localStorage.getItem('dukaan_khata')) || [];

function renderKhata() {
  let total = 0;
  savedKhata.forEach(item => total += parseFloat(item.amount) || 0);
  totalKhataOut.textContent = `₹${total.toLocaleString('en-IN')}`;

  if(savedKhata.length === 0) {
    khataList.innerHTML = 'अभी कोई एंट्री नहीं है।';
    return;
  }
  let html = '<table class="khata-table"><tr><th>ग्राहक</th><th>बाकी</th><th>विवरण</th><th>एक्शन</th></tr>';
  savedKhata.forEach((item, index) => {
    html += `<tr>
      <td><b>${item.name}</b><br><small style="color:#666">${item.date}</small></td>
      <td style="color:#b91c1c;font-weight:bold;">₹${parseFloat(item.amount).toLocaleString('en-IN')}</td>
      <td>${item.desc || '-'}</td>
      <td style="white-space:nowrap;">
        <button onclick="sendWhatsApp(${index})" class="btn-wa">WhatsApp</button>
        <button onclick="deleteKhata(${index})" class="btn-del" title="जमा/हटाएं">✓</button>
      </td>
    </tr>`;
  });
  html += '</table>';
  khataList.innerHTML = html;
}

saveKhataBtn.addEventListener('click', () => {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const amount = document.getElementById('custAmount').value.trim();
  const desc = document.getElementById('custDesc').value.trim();

  if(!name || !amount) {
    alert('कृपया ग्राहक का नाम और उधार राशि दर्ज करें।');
    return;
  }

  const newEntry = { name, phone, amount, desc, date: new Date().toLocaleDateString('hi-IN') };
  savedKhata.unshift(newEntry);
  localStorage.setItem('dukaan_khata', JSON.stringify(savedKhata));
  renderKhata();

  document.getElementById('custName').value = '';
  document.getElementById('custPhone').value = '';
  document.getElementById('custAmount').value = '';
  document.getElementById('custDesc').value = '';
});

window.sendWhatsApp = function(index) {
  const item = savedKhata[index];
  const msg = `नमस्ते ${item.name}, आपकी दुकान का कुल उधार ₹${item.amount} बाकी है (${item.desc || 'सामान'})। कृपया समय पर भुगतान करें। - DukaanGanit (https://deendayalhalwai.github.io/DukaanGanit/)`;
  const cleanPhone = item.phone ? item.phone.replace(/\D/g, '').slice(-10) : '';
  const url = `https://wa.me/${cleanPhone ? '91' + cleanPhone : ''}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};

window.deleteKhata = function(index) {
  if(confirm('क्या इस ग्राहक का उधार जमा हो गया है और इसे लिस्ट से हटाना है?')) {
    savedKhata.splice(index, 1);
    localStorage.setItem('dukaan_khata', JSON.stringify(savedKhata));
    renderKhata();
  }
};

renderKhata();