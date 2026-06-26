let currentImgBase64 = "";

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('text-blue-600');
        nav.classList.add('text-slate-400');
    });
    document.getElementById(tabId).classList.add('active');
    el.classList.remove('text-slate-400');
    el.classList.add('text-blue-600');
    document.getElementById('page-title').innerText = tabId.toUpperCase();
    window.scrollTo(0,0);
    
    if (tabId === 'guide') {
        setTimeout(() => {
            initRouteMap();
        }, 100);
    }
}

function calculateRate() {
    const input = document.getElementById('calc-input').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    try {
        const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
        document.getElementById('calc-result').innerText = `NT$ ${Math.round(result * rate).toLocaleString()}`;
    } catch (e) { alert("計算格式錯誤"); }
}

function handleImage(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const scale = 300 / img.width;
            canvas.width = 300;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentImgBase64 = canvas.toDataURL('image/jpeg', 0.5);
            document.getElementById('img-preview').src = currentImgBase64;
            document.getElementById('img-preview').classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function addExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    if(!name || !amount) return;
    const expenses = JSON.parse(localStorage.getItem('shizuoka_expenses') || '[]');
    expenses.unshift({ id: Date.now(), name, jpy: amount, twd: Math.round(amount * rate), img: currentImgBase64 });
    localStorage.setItem('shizuoka_expenses', JSON.stringify(expenses));
    document.getElementById('expense-name').value = "";
    document.getElementById('expense-amount').value = "";
    document.getElementById('img-preview').classList.add('hidden');
    currentImgBase64 = "";
    renderExpenses();
}

function renderExpenses() {
    const expenses = JSON.parse(localStorage.getItem('shizuoka_expenses') || '[]');
    const container = document.getElementById('expense-list');
    if (!container) return;
    container.innerHTML = expenses.map(ex => `
        <div class="card p-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                ${ex.img ? `<img src="${ex.img}" class="w-10 h-10 rounded object-cover">` : '<i class="fas fa-receipt text-slate-300 ml-2"></i>'}
                <div>
                    <p class="text-xs font-bold">${ex.name}</p>
                    <p class="text-[10px] text-slate-400">¥${ex.jpy} ≈ NT$${ex.twd}</p>
                </div>
            </div>
            <button onclick="deleteEx(${ex.id})" class="text-slate-300 px-2 text-xl">×</button>
        </div>
    `).join('');
}

function deleteEx(id) {
    const expenses = JSON.parse(localStorage.getItem('shizuoka_expenses') || '[]').filter(e => e.id !== id);
    localStorage.setItem('shizuoka_expenses', JSON.stringify(expenses));
    renderExpenses();
}

const defaultList = ["護照", "國際駕照", "網卡/eSIM", "行動電源", "VJW QR Code", "日幣現金", "IC 卡（Suica）"];
function renderChecklist() {
    let list = JSON.parse(localStorage.getItem('shizuoka_check')) || defaultList.map(t => ({t, c: false}));
    const container = document.getElementById('checklist');
    if (!container) return;
    container.innerHTML = list.map((item, i) => `
        <label class="flex items-center gap-3 text-xs py-1">
            <input type="checkbox" ${item.c?'checked':''} onchange="toggleCheck(${i})">
            <span class="${item.c?'line-through text-slate-300':''}">${item.t}</span>
        </label>
    `).join('');
    localStorage.setItem('shizuoka_check', JSON.stringify(list));
}

function toggleCheck(i) {
    const list = JSON.parse(localStorage.getItem('shizuoka_check'));
    list[i].c = !list[i].c;
    localStorage.setItem('shizuoka_check', JSON.stringify(list));
    renderChecklist();
}

function saveMemo() {
    const val = document.getElementById('memo-input').value;
    localStorage.setItem('shizuoka_memo', val);
    const urls = val.match(/(https?:\/\/[^\s]+)/g) || [];
    document.getElementById('memo-links').innerHTML = urls.map(u => `<a href="${u}" target="_blank" class="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px]">連結</a>`).join('');
}

let routeMap = null;

function initRouteMap() {
    const mapContainer = document.getElementById('route-map');
    if (!mapContainer || routeMap) return;
    
    routeMap = L.map('route-map').setView([34.97, 138.38], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
    
    const locations = [
        { lat: 35.6284, lng: 139.7387, name: '台場', color: 'blue' },
        { lat: 35.6094, lng: 139.7302, name: '品川・天王洲', color: 'blue' },
        { lat: 34.9714, lng: 138.3884, name: '靜岡站', color: 'blue' },
        { lat: 35.4978, lng: 138.7556, name: '田貫湖', color: 'orange' },
        { lat: 35.3153, lng: 138.6214, name: '富士宮', color: 'orange' },
        { lat: 34.9978, lng: 138.5289, name: '三保之松原', color: 'blue' },
        { lat: 35.0153, lng: 138.4967, name: '清水港', color: 'blue' },
        { lat: 35.4437, lng: 139.6380, name: '橫濱・櫻木町', color: 'blue' },
        { lat: 35.4545, lng: 139.6311, name: 'Cosmoworld', color: 'blue' },
        { lat: 35.4567, lng: 139.6325, name: 'World Porters', color: 'blue' },
        { lat: 35.4658, lng: 139.6223, name: '橫濱站・JOINUS', color: 'blue' },
        { lat: 35.4430, lng: 139.6450, name: '日ノ出町', color: 'orange' },
        { lat: 35.3394, lng: 139.6103, name: '八景島', color: 'orange' },
        { lat: 35.4950, lng: 139.3628, name: 'Zoorasia', color: 'orange' }
    ];
    
    locations.forEach(loc => {
        const markerColor = loc.color === 'orange' ? '#f97316' : '#3b82f6';
        L.circleMarker([loc.lat, loc.lng], {
            radius: 8,
            fillColor: markerColor,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(routeMap).bindPopup(loc.name);
    });
}

window.onload = () => {
    renderExpenses();
    renderChecklist();
    document.getElementById('memo-input').value = localStorage.getItem('shizuoka_memo') || "";
    saveMemo();
    document.getElementById('manual-rate').addEventListener('input', (e) => {
        document.getElementById('rate-display').innerText = e.target.value;
    });
    initMetroMapZoom();
    
    setTimeout(() => {
        initRouteMap();
    }, 100);
};

const dayDetails = {
    day1: '【航班】\nANA NH852\nTPE 第1航廈 13:30 → HND 第2航廈 17:45\n\n【機場→品川】\n1）東京單軌電車 [羽田] → [天王洲島]（約 20 分）\n2）京急線 [羽田] → [品川]（約 25 分，19:31 起約 10 分鐘一班，可用 IC 卡）\n3）接駁車 [品川] → [東橫INN 品川港南口天王洲島]（約 10 分）\n   ※ JR 品川站港南口 → 電扶梯下樓 →「富士蕎麥」右轉 → 大路邊等接駁車\n\n【住宿】\n東橫INN 東京品川港南口天王洲島\nCheck-in 15:00 / 含早餐\n\n【行程】\n周邊逛逛、台場\n\n【餐食】\n早：Home / 午：飛機 / 晚：常喜房・Mitsuboshi・TAKA',
    day2: '【上午・台場】\n1）臨海線（りんかい線）[天王洲] → [東京テレポート]（約 5 分）\n2）台場 DiverCity（鋼彈變身 11:00 / 13:00 / 15:00 / 17:00）\n3）臨海線 [東京テレポート] → [天王洲] 回飯店\n4）接駁車 [東橫INN] → [品川] 拿行李\n\n【新幹線】\n東海道新幹線 光芒號 Hikari\n[品川] → [靜岡] 16:10 發 / 17:02 抵（約 52 分）\n備選：回聲號 Kodama 16:34 發 / 17:47 抵（約 1h3m）\n\n【住宿】\n靜鐵 Prezio 飯店 靜岡站南\nCheck-in 15:00 / 不含早餐\n\n【餐食】\n早：飯店 / 午：台場 DiverCity / 晚：靜岡車站',
    day3: '【交通手段】\n自駕（需國際駕照）\n\n【行程】\n1）田貫湖\n2）白絲瀑布\n3）富士宮\n4）富士山遺產中心\n\n【住宿】\n靜鐵 Prezio 飯店 靜岡站南\n\n【餐食】\n早：飯店 / 午：富士宮炒麵',
    day4: '【交通手段】\n大眾交通（T08 巴士路線待確認）\n\n【行程】\n1）JR 東海道本線 [靜岡] → [清水站]（約 15 分）\n2）巴士? [清水站] → [三保之松原]\n3）清水港・魚市場（船）\n4）S-Pulse Dream Plaza / 小丸子樂園（走路）\n5）免費接駁巴士 [Dream Plaza] → [清水站]\n6）JR [清水站] → [靜岡]（約 15 分）\n\n【備註】\n原方案：水上巴士 [江尻] ↔ [三保] 亦可參考\n\n【餐食】\n早：便利商店 / 午：清水港魚市場 / 晚：Dream Plaza',
    day5: '【上午】\nCheck Out，行李放飯店\n靜岡 HOBBY SQUARE（模型店）\n回飯店拿行李\n\n【新幹線】\n東海道新幹線 光芒號 Hikari\n[靜岡] → [新橫濱] 15:41 發 / 16:24 抵（約 45 分）\n備選：回聲號 Kodama 15:56 發 / 16:59 抵（約 1hr）\n\n【橫濱】\nJR 橫濱/根岸線 [新橫濱] → [櫻木町]（約 15 分）\n※ 搭大船行/磯子行/櫻木町行，避開東神奈川・橫濱（需轉車）\n※ 若班次不順，改搭地鐵藍線\n出站走路至飯店，休息後去野毛町晚餐\n\n【住宿】\n橫濱櫻木町 JR 東日本大都會高級酒店\nCheck-in 15:00 / 不含早餐\n\n【餐食】\n早：便利商店 / 午：靜岡車站 / 晚：野毛町',
    day6: '【交通手段】\nJR 根岸線 + 走路\n\n【行程】\n1）JR 根岸線 [櫻木町] → [橫濱] JOINUS Shopping\n2）JR 根岸線 [橫濱] → [櫻木町] 回飯店放東西、休息\n3）走路 飯店 → Cosmoworld（約 15 分）\n4）走路 Cosmoworld → World Porters（約 3 分）\n   2F 扭蛋 / RF 夜景\n5）走路 World Porters → 飯店（約 3 分）\n\n【餐食】\n早：櫻木町站內 / 午：JOINUS / 晚：World Porters\n\n【備選景點】\n八景島 / Zoorasia / 大棧橋 / 冰川丸 / MITSUI OUTLET',
    day7: '【前往機場】\n1）走路 飯店 → 日ノ出町駅\n2）京急線 機場特急 [日ノ出町] → [羽田]（約 30 分）\n\n【備案】\nJR 根岸線 [櫻木町] → [橫濱]\n→ 京急線 [日ノ出町] → [羽田]\n\n【航班】\nANA NH853\nHND 第2航廈 13:20 → TPE 第1航廈 15:50\n\n【提醒】\n1）建議預留充足時間前往羽田\n2）起飛前 48 至 3 小時可免費選座'
};

function initTransportModal() {
    const transportSection = document.getElementById('transport');
    if (!transportSection) return;

    const cards = transportSection.querySelectorAll('.card[data-day]');
    
    const modal = document.getElementById('transport-modal');
    const modalTitle = document.getElementById('transport-modal-title');
    const modalBody = document.getElementById('transport-modal-body');
    const closeBtn = document.getElementById('transport-modal-close');

    if (!modal || !modalTitle || !modalBody || !closeBtn) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const dayKey = card.getAttribute('data-day');
            const titleEl = card.querySelector('h3');

            modalTitle.innerText = titleEl ? titleEl.innerText : 'Detail';
            modalBody.innerText = dayDetails[dayKey] || 'No details yet.';

            modal.classList.remove('hidden');
        });
    });

    const hideModal = () => {
        modal.classList.add('hidden');
    };

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
}

window.addEventListener('load', initTransportModal);

let metroZoom = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    baseScale: 1,
    baseTx: 0,
    baseTy: 0,
    lastPinchDist: 0,
    lastCenterX: 0,
    lastCenterY: 0,
    lastTapTime: 0
};

function getTouchCenter(touches) {
    const n = touches.length;
    let x = 0, y = 0;
    for (let i = 0; i < n; i++) {
        x += touches[i].clientX;
        y += touches[i].clientY;
    }
    return { x: x / n, y: y / n };
}

function getPinchDistance(touches) {
    if (touches.length < 2) return 0;
    const a = touches[0], b = touches[1];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function applyMetroTransform() {
    const content = document.getElementById('metro-map-content');
    if (!content) return;
    const { scale, translateX, translateY } = metroZoom;
    content.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

function initMetroMapZoom() {
    const viewport = document.getElementById('metro-map-viewport');
    const content = document.getElementById('metro-map-content');
    const img = document.getElementById('metro-map-img');
    if (!viewport || !content || !img) return;

    viewport.addEventListener('touchstart', function (e) {
        const touches = e.touches;
        if (touches.length === 2) {
            metroZoom.baseScale = metroZoom.scale;
            metroZoom.baseTx = metroZoom.translateX;
            metroZoom.baseTy = metroZoom.translateY;
            metroZoom.lastPinchDist = getPinchDistance(touches);
            const c = getTouchCenter(touches);
            metroZoom.lastCenterX = c.x;
            metroZoom.lastCenterY = c.y;
        }
        if (touches.length === 1) {
            const t = touches[0];
            metroZoom.pointerStartX = t.clientX;
            metroZoom.pointerStartY = t.clientY;
            metroZoom.startTx = metroZoom.translateX;
            metroZoom.startTy = metroZoom.translateY;
            const now = Date.now();
            if (now - metroZoom.lastTapTime < 350) {
                if (metroZoom.scale > 1.1) {
                    metroZoom.scale = 1;
                    metroZoom.translateX = 0;
                    metroZoom.translateY = 0;
                } else {
                    metroZoom.scale = 2;
                    const rect = viewport.getBoundingClientRect();
                    metroZoom.translateX = rect.width / 2 - (t.clientX - rect.left);
                    metroZoom.translateY = rect.height / 2 - (t.clientY - rect.top);
                }
                applyMetroTransform();
                metroZoom.lastTapTime = 0;
                return;
            }
            metroZoom.lastTapTime = now;
        }
    }, { passive: true });

    viewport.addEventListener('touchmove', function (e) {
        const touches = e.touches;
        if (touches.length === 2) {
            e.preventDefault();
            const dist = getPinchDistance(touches);
            if (metroZoom.lastPinchDist > 0) {
                const factor = dist / metroZoom.lastPinchDist;
                let newScale = metroZoom.baseScale * factor;
                newScale = Math.max(0.5, Math.min(4, newScale));
                const c = getTouchCenter(touches);
                const dx = c.x - metroZoom.lastCenterX;
                const dy = c.y - metroZoom.lastCenterY;
                metroZoom.scale = newScale;
                metroZoom.translateX = metroZoom.baseTx + dx;
                metroZoom.translateY = metroZoom.baseTy + dy;
                metroZoom.lastPinchDist = dist;
                metroZoom.lastCenterX = c.x;
                metroZoom.lastCenterY = c.y;
                applyMetroTransform();
            }
        }
        if (touches.length === 1 && metroZoom.scale > 1) {
            e.preventDefault();
            const dx = touches[0].clientX - (metroZoom.pointerStartX ?? touches[0].clientX);
            const dy = touches[0].clientY - (metroZoom.pointerStartY ?? touches[0].clientY);
            metroZoom.translateX = (metroZoom.startTx ?? metroZoom.translateX) + dx;
            metroZoom.translateY = (metroZoom.startTy ?? metroZoom.translateY) + dy;
            metroZoom.pointerStartX = touches[0].clientX;
            metroZoom.pointerStartY = touches[0].clientY;
            metroZoom.startTx = metroZoom.translateX;
            metroZoom.startTy = metroZoom.translateY;
            applyMetroTransform();
        }
    }, { passive: false });

    viewport.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            metroZoom.lastPinchDist = 0;
        }
    }, { passive: true });

    viewport.addEventListener('wheel', function (e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.15 : 0.15;
        let newScale = metroZoom.scale + delta;
        newScale = Math.max(0.5, Math.min(4, newScale));
        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const scaleFactor = newScale / metroZoom.scale;
        metroZoom.translateX = x - (x - metroZoom.translateX) * scaleFactor;
        metroZoom.translateY = y - (y - metroZoom.translateY) * scaleFactor;
        metroZoom.scale = newScale;
        applyMetroTransform();
    }, { passive: false });
}

function resetMetroMapZoom() {
    metroZoom.scale = 1;
    metroZoom.translateX = 0;
    metroZoom.translateY = 0;
    applyMetroTransform();
}

function openMetroMap(e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('metro-modal');
    if (modal) {
        resetMetroMapZoom();
        modal.classList.remove('hidden');
    }
}

function closeMetroMap() {
    const modal = document.getElementById('metro-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    resetMetroMapZoom();
}

function openRailMap(e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('rail-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeRailMap() {
    const modal = document.getElementById('rail-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

const ticketDetails = {
    'day2-shinkansen': {
        title: 'Day 2 新幹線：品川 → 靜岡',
        sections: [
            {
                title: '光芒號 Hikari（約 46–52 分）',
                adult: '¥6,410（約 NT$1,282）',
                child: '¥3,200（約 NT$640）'
            },
            {
                title: '回聲號 Kodama（約 1h3m）',
                adult: '¥6,410（約 NT$1,282）',
                child: '¥3,200（約 NT$640）'
            },
            {
                title: 'Platt Kodama 早鳥優惠',
                adult: '9折 / 7折 / 6折（指定席+送飲料，不可更改）',
                child: '同大人折扣'
            }
        ]
    },
    'day4-transport': {
        title: 'Day 4 交通票：三保・清水',
        sections: [
            {
                title: 'JR 靜岡站 ↔ 清水站',
                adult: '¥（IC 卡或單程票）',
                child: '¥（IC 卡或單程票）'
            },
            {
                title: '巴士? 清水站 ↔ 三保之松原（T08 待確認）',
                adult: '¥（待確認）',
                child: '¥（待確認）'
            },
            {
                title: '清水港船 / 水上巴士',
                adult: '¥（現場購票）',
                child: '¥（現場購票）'
            },
            {
                title: 'Dream Plaza 免費接駁巴士',
                adult: '免費',
                child: '免費'
            }
        ]
    },
    'day4-spot': {
        title: 'Day 4 景點票：小丸子樂園',
        sections: [
            {
                title: 'S-Pulse Dream Plaza 小丸子樂園',
                adult: '¥（官網查詢）',
                child: '¥（官網查詢）'
            }
        ]
    },
    'day5-shinkansen': {
        title: 'Day 5 新幹線：靜岡 → 新橫濱',
        sections: [
            {
                title: '光芒號 Hikari（約 45 分）',
                adult: '¥（依實際購票）',
                child: '¥（依實際購票）'
            },
            {
                title: '回聲號 Kodama（約 1hr）',
                adult: '¥（依實際購票）',
                child: '¥（依實際購票）'
            }
        ]
    },
    'day5-jr': {
        title: 'Day 5 交通票：新橫濱 → 櫻木町',
        sections: [
            {
                title: 'JR 橫濱/根岸線 [新橫濱] → [櫻木町]',
                adult: '¥（IC 卡）',
                child: '¥（IC 卡）'
            },
            {
                title: '備案：市營地下鐵藍線 [新橫濱] → [櫻木町]',
                adult: '¥（IC 卡）',
                child: '¥（IC 卡）'
            }
        ]
    },
    'day7-keikyu': {
        title: 'Day 7 交通票：橫濱 → 羽田',
        sections: [
            {
                title: '京急線 機場特急 [日ノ出町] → [羽田]',
                adult: '¥（IC 卡，約 30 分）',
                child: '¥（IC 卡）'
            },
            {
                title: '備案：JR 根岸線 + 京急',
                adult: '¥（IC 卡）',
                child: '¥（IC 卡）'
            }
        ]
    }
};

function initTicketModal() {
    const section = document.getElementById('ticket');
    if (!section) return;

    const items = section.querySelectorAll('.ticket-item[data-ticket]');
    const modal = document.getElementById('ticket-modal');
    const titleEl = document.getElementById('ticket-modal-title');
    const subtitleEl = document.getElementById('ticket-modal-subtitle');
    const contentEl = document.getElementById('ticket-modal-content');

    if (!modal || !titleEl || !subtitleEl || !contentEl) return;

    items.forEach(item => {
        item.addEventListener('click', () => {
            const key = item.getAttribute('data-ticket');
            const data = ticketDetails[key];
            if (!data) return;

            const parts = (data.title || '').split('：');
            titleEl.innerText = parts[0] ? parts[0] + '：' : '';
            subtitleEl.innerText = parts[1] || '';

            const sections = data.sections || [];
            contentEl.innerHTML = sections.map((sec, idx) => `
                <div class="space-y-1">
                    ${sec.title ? `<p class="font-semibold text-slate-900">${sec.title}</p>` : ''}
                    <p><span class="font-semibold text-slate-900">大人：</span>${sec.adult || '—'}</p>
                    <p><span class="font-semibold text-slate-900">小孩：</span>${sec.child || '—'}</p>
                </div>
                ${idx < sections.length - 1 ? '<hr class="border-slate-100">' : ''}
            `).join('');

            modal.classList.remove('hidden');
        });
    });
}

function closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.addEventListener('load', initTicketModal);
