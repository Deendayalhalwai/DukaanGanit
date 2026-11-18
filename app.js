let currentLang = localStorage.getItem('dg_lang') || 'hi';
let khataData = JSON.parse(localStorage.getItem('dg_khata') || '[]');
let dailyData = JSON.parse(localStorage.getItem('dg_daily') || '[]');
let billItems = [];
let calcExp = '';

const translations = {
  hi: {
    tab_khata: '📒 उधार खाता',
    tab_daily: '📊 बिक्री-खर्च',
    tab_bill: '🧾 पक्का बिल',
    tab_calc: '🔢 कैलकुलेटर',
    tab_backup: '☁️ बैकअप',
    total_jama: 'कुल जमा (आया)',
    total_udhar: 'कुल उधार (बाकी)',
    add_khata_entry: 'ग्राहक का हिसाब जोड़ें',
    btn_udhar: '+ उधार दिया (बाकी)',
    btn_jama: '+ जमा मिला (नकद)',
    khata_list: 'ग्राहक सूची',
    today_sales: 'कुल बिक्री',
    today_expense: 'कुल खर्च',
    net_profit: 'शुद्ध मुनाफा',
    add_daily_entry: 'दैनिक बिक्री या खर्च लिखें',
    opt_sale: 'बिक्री (Sale +)',
    opt_expense: 'दुकान खर्च (Expense -)',
    btn_save_entry: 'रजिस्टर में सेव करें',
    daily_history: 'बिक्री और खर्च विवरण',
    create_bill: 'डिजिटल बिल / पर्ची बनाएं',
    grand_total: 'कुल योग:',
    btn_wa_bill: '📲 WhatsApp पर भेजें',
    btn_print_bill: '🖨️ प्रिंट / PDF सेव करें',
    btn_clear: 'साफ़ करें',
    calc_title: 'दुकान कैलकुलेटर',
    backup_title: 'डेटा बैकअप और सुरक्षा (Cloud Safety)',
    backup_desc: 'आपका सारा हिसाब आपके फोन में सुरक्षित रहता है। नया फोन लेने पर या सुरक्षा के लिए नीचे दिए बटन से बैकअप फाइल डाउनलोड करके Google Drive या WhatsApp पर सेव रख सकते हैं।',
    btn_export: '⬇️ पूरा डेटा बैकअप डाउनलोड करें (.json)',
    lbl_import: 'पुरानी बैकअप फाइल से डेटा वापस लाएं (Restore):',
    link_about: 'हमारे बारे में',
    link_privacy: 'गोपनीयता नीति',
    link_contact: 'संपर्क करें'
  },
  en: {
    tab_khata: '📒 Credit Ledger',
    tab_daily: '📊 Sales & Expense',
    tab_bill: '🧾 Digital Bill',
    tab_calc: '🔢 Calculator',
    tab_backup: '☁️ Backup',
    total_jama: 'Total Received',
    total_udhar: 'Total Credit (Due)',
    add_khata_entry: 'Add Customer Entry',
    btn_udhar: '+ Gave Credit (Due)',
    btn_jama: '+ Received Cash',
    khata_list: 'Customer List',
    today_sales: 'Total Sales',
    today_expense: 'Total Expense',
    net_profit: 'Net Profit',
    add_daily_entry: 'Record Daily Sale or Expense',
    opt_sale: 'Sale (+)',
    opt_expense: 'Shop Expense (-)',
    btn_save_entry: 'Save to Register',
    daily_history: 'Sales & Expense History',
    create_bill: 'Create Digital Invoice / Receipt',
    grand_total: 'Grand Total:',
    btn_wa_bill: '📲 Send on WhatsApp',
    btn_print_bill: '🖨️ Print / Save PDF',
    btn_clear: 'Clear',
    calc_title: 'Shop Calculator',
    backup_title: 'Data Backup & Cloud Safety',
    backup_desc: 'All your records are saved safely on your phone. Download a backup file below and save it on Google Drive or WhatsApp so you never lose your data.',
    btn_export: '⬇️ Download Full Data Backup (.json)',
    lbl_import: 'Restore Data from Backup File:',
    link_about: 'About Us',
    link_privacy: 'Privacy Policy',
    link_contact: 'Contact Us'
  }
};

function applyLanguage() {
  document.getElementById('langBtn').textContent = currentLang === 'hi' ? 'English' : 'हिन्दी';
  document.getElementById('appSubtitle').textContent = currentLang === 'hi' ? 'स्मार्ट दुकान हिसाब व बिलिंग' : 'Smart Shop Ledger & Billing';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
}

function toggleLanguage() {
  currentLang = currentLang === 'hi' ? 'en' : 'hi';
  localStorage.setItem('dg_lang', currentLang);
  applyLanguage();
}

function switchTab(tabId, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  btn.classList.add('active');
}

function addKhataEntry(type) {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const amount = parseFloat(document.getElementById('custAmount').value);
  const note = document.getElementById('custNote').value.trim();

  if (!name || isNaN(amount) || amount <= 0) {
    alert(currentLang === 'hi' ? 'कृपया ग्राहक का नाम और सही राशि लिखें!' : 'Please enter customer name and valid amount!');
    return;
  }

  khataData.unshift({
    id: Date.now(),
    name,
    phone,
    amount,
    type,
    note,
    date: new Date().toLocaleDateString('hi-IN')
  });

  localStorage.setItem('dg_khata', JSON.stringify(khataData));
  document.getElementById('custName').value = '';
  document.getElementById('custPhone').value = '';
  document.getElementById('custAmount').value = '';
  document.getElementById('custNote').value = '';
  renderKhata();
}

function renderKhata() {
  const query = (document.getElementById('searchKhata').value || '').toLowerCase();
  const list = document.getElementById('khataList');
  list.innerHTML = '';

  let totalUdhar = 0;
  let totalJama = 0;

  khataData.forEach(item => {
    if (item.type === 'udhar') totalUdhar += item.amount;
    else totalJama += item.amount;

    if (!item.name.toLowerCase().includes(query)) return;

    const div = document.createElement('div');
    div.className = 'entry-item';
    div.innerHTML = `
      <div class="entry-info">
        <strong>${item.name}</strong>
        <span>${item.date} ${item.note ? '• ' + item.note : ''}</span>
      </div>
      <div class="entry-actions">
        <span class="${item.type === 'udhar' ? 'badge-udhar' : 'badge-jama'}">
          ${item.type === 'udhar' ? 'उधार' : 'जमा'} ₹${item.amount}
        </span>
        <button class="icon-btn wa" onclick="shareKhataWA(${item.id})" title="WhatsApp">📲</button>
        <button class="icon-btn" onclick="deleteKhata(${item.id})" title="Delete">🗑️</button>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('khataTotalUdhar').textContent = '₹' + totalUdhar;
  document.getElementById('khataTotalJama').textContent = '₹' + totalJama;
}

function shareKhataWA(id) {
  const item = khataData.find(x => x.id === id);
  if (!item) return;
  const status = item.type === 'udhar' ? 'बाकी उधार (Due)' : 'जमा प्राप्त (Received)';
  const msg = `नमस्ते ${item.name},\nDukaanGanit डिजिटल पर्ची:\nतारीख: ${item.date}\nराशि: ₹${item.amount} (${status})\nविवरण: ${item.note || '-'}\nधन्यवाद!`;
  const phone = item.phone ? item.phone.replace(/[^0-9]/g, '') : '';
  const url = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function deleteKhata(id) {
  khataData = khataData.filter(x => x.id !== id);
  localStorage.setItem('dg_khata', JSON.stringify(khataData));
  renderKhata();
}

function addDailyEntry() {
  const type = document.getElementById('dailyType').value;
  const amount = parseFloat(document.getElementById('dailyAmount').value);
  const desc = document.getElementById('dailyDesc').value.trim();

  if (isNaN(amount) || amount <= 0) {
    alert(currentLang === 'hi' ? 'कृपया सही राशि लिखें!' : 'Please enter a valid amount!');
    return;
  }

  dailyData.unshift({
    id: Date.now(),
    type,
    amount,
    desc: desc || (type === 'sale' ? 'दैनिक बिक्री' : 'दुकान खर्च'),
    date: new Date().toLocaleDateString('hi-IN')
  });

  localStorage.setItem('dg_daily', JSON.stringify(dailyData));
  document.getElementById('dailyAmount').value = '';
  document.getElementById('dailyDesc').value = '';
  renderDaily();
}

function renderDaily() {
  const list = document.getElementById('dailyList');
  list.innerHTML = '';
  let sales = 0;
  let exp = 0;

  dailyData.forEach(item => {
    if (item.type === 'sale') sales += item.amount;
    else exp += item.amount;

    const div = document.createElement('div');
    div.className = 'entry-item';
    div.innerHTML = `
      <div class="entry-info">
        <strong>${item.desc}</strong>
        <span>${item.date}</span>
      </div>
      <div class="entry-actions">
        <span class="${item.type === 'sale' ? 'badge-jama' : 'badge-udhar'}">
          ${item.type === 'sale' ? '+' : '-'} ₹${item.amount}
        </span>
        <button class="icon-btn" onclick="deleteDaily(${item.id})">🗑️</button>
      </div>
    `;
    list.appendChild(div);
  });

  document.getElementById('dailyTotalSales').textContent = '₹' + sales;
  document.getElementById('dailyTotalExp').textContent = '₹' + exp;
  document.getElementById('dailyNetProfit').textContent = '₹' + (sales - exp);
}

function deleteDaily(id) {
  dailyData = dailyData.filter(x => x.id !== id);
  localStorage.setItem('dg_daily', JSON.stringify(dailyData));
  renderDaily();
}

function addBillItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseFloat(document.getElementById('itemQty').value) || 1;
  const price = parseFloat(document.getElementById('itemPrice').value);

  if (!name || isNaN(price) || price <= 0) return;

  billItems.push({ name, qty, price, total: qty * price });
  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '1';
  document.getElementById('itemPrice').value = '';
  renderBill();
}

function renderBill() {
  const list = document.getElementById('billItemsList');
  list.innerHTML = '';
  let grand = 0;

  billItems.forEach((it, idx) => {
    grand += it.total;
    const row = document.createElement('div');
    row.className = 'bill-row';
    row.innerHTML = `
      <span>${idx + 1}. ${it.name} (${it.qty} × ₹${it.price})</span>
      <strong>₹${it.total}</strong>
    `;
    list.appendChild(row);
  });

  document.getElementById('billGrandTotal').textContent = '₹' + grand;
}

function shareBillWhatsApp() {
  if (billItems.length === 0) return;
  const shop = document.getElementById('shopName').value.trim() || 'DukaanGanit Store';
  const cust = document.getElementById('billCustName').value.trim() || 'ग्राहक';
  const phone = document.getElementById('billCustPhone').value.replace(/[^0-9]/g, '');

  let lines = [`*${shop}*`, `ग्राहक: ${cust}`, `तारीख: ${new Date().toLocaleDateString('hi-IN')}`, `----------------`];
  let grand = 0;
  billItems.forEach((it, i) => {
    grand += it.total;
    lines.push(`${i + 1}. ${it.name} (${it.qty}x${it.price}) = ₹${it.total}`);
  });
  lines.push(`----------------`);
  lines.push(`*कुल राशि: ₹${grand}*`);
  lines.push(`धन्यवाद! पुनः पधारें।`);

  const msg = lines.join('\n');
  const url = phone ? `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function printBill() {
  window.print();
}

function clearBill() {
  billItems = [];
  renderBill();
}

function calcInput(val) {
  calcExp += val;
  document.getElementById('calcDisplay').textContent = calcExp;
}

function calcClear() {
  calcExp = '';
  document.getElementById('calcDisplay').textContent = '0';
}

function calcBack() {
  calcExp = calcExp.slice(0, -1);
  document.getElementById('calcDisplay').textContent = calcExp || '0';
}

function calcEqual() {
  try {
    const res = Function('"use strict";return (' + calcExp + ')')();
    calcExp = String(res);
    document.getElementById('calcDisplay').textContent = calcExp;
  } catch {
    document.getElementById('calcDisplay').textContent = 'Error';
    calcExp = '';
  }
}

function exportBackup() {
  const backup = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    khata: khataData,
    daily: dailyData
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `DukaanGanit_Backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.khata)) {
        khataData = data.khata;
        localStorage.setItem('dg_khata', JSON.stringify(khataData));
      }
      if (Array.isArray(data.daily)) {
        dailyData = data.daily;
        localStorage.setItem('dg_daily', JSON.stringify(dailyData));
      }
      renderKhata();
      renderDaily();
      alert(currentLang === 'hi' ? 'डेटा सफलतापूर्वक वापस आ गया!' : 'Data restored successfully!');
    } catch {
      alert(currentLang === 'hi' ? 'गलत बैकअप फाइल!' : 'Invalid backup file!');
    }
  };
  reader.readAsText(file);
}

applyLanguage();
renderKhata();
renderDaily();
