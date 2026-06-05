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

const defaultList = ["護照", "網卡/eSIM", "行動電源", "VJW QR", "日幣現金"];
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
        { lat: 34.9714, lng: 138.3884, name: '靜岡站/市區', color: 'blue' },
        { lat: 34.9772, lng: 138.3831, name: '駿府城公園', color: 'blue' },
        { lat: 34.9642, lng: 138.4228, name: '日本平', color: 'orange' },
        { lat: 34.9978, lng: 138.5289, name: '三保松原', color: 'blue' },
        { lat: 35.0153, lng: 138.4967, name: '清水港', color: 'blue' },
        { lat: 34.6358, lng: 138.9478, name: '久能山東照宮', color: 'orange' },
        { lat: 34.7962, lng: 138.1872, name: '富士山靜岡機場', color: 'blue' }
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
    day1: '【航班】\n1）ANA NH852\n2）TPE 第1航廈 13:30 → HND 第2航廈 17:45\n\n【抵達後】\n1）前往品川住宿\n2）東橫INN 東京品川港南口天王洲島\n\n【市區】\n1）台場',
    day2: '【交通手段】\n1）JR 東海道新幹線（光芒號 Hikari）\n2）[品川] → [靜岡]\n\n【班次】\n1）14:10 發車 / 15:02 抵達（約 52 分）\n\n【抵達後】\n1）靜岡車站\n2）住宿：靜岡站南靜鐵酒店 Prezio',
    day3: '【交通手段】\n1）自駕\n\n【行程】\n1）田貫湖\n2）白絲瀑布\n3）富士宮\n4）富士山遺產中心',
    day4: '【交通手段】\n1）大眾交通\n\n【行程】\n1）清水港・魚市場\n2）S-Pulse Dream Plaza\n3）小丸子樂園\n4）三保之松原',
    day5: '【交通手段】\n1）JR 東海道新幹線\n2）[靜岡] → [新橫濱站]\n3）JR 橫濱線直通根岸線\n4）[新橫濱站] → [櫻木町站]\n\n【行程】\n1）靜岡車站模型店\n2）住宿：橫濱櫻木町 JR 東日本大都會高級酒店',
    day6: '【交通手段】\n1）橫濱市區大眾交通\n\n【行程】\n1）橫濱紅磚倉庫\n2）八景島海島樂園\n3）橫濱動物園 Zoorasia\n4）大棧橋碼頭',
    day7: '【航班】\n1）ANA NH853\n2）HND 第2航廈 13:20 → TPE 第1航廈 15:50\n\n【出發小提醒】\n1）建議預留充足時間從橫濱前往羽田機場'
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
    'day1-transport': {
        title: 'Day 1 交通票：新幹線 → 靜岡站',
        sections: [
            {
                title: '',
                adult: '¥（可填入新幹線大人票價）',
                child: '¥（可填入新幹線小孩票價）'
            }
        ]
    },
    'day2-transport': {
        title: 'Day 2 交通票：JR 清水線 / 靜鐵',
        sections: [
            {
                title: 'JR 靜岡站 ↔ 清水站',
                adult: '¥（可填入大人來回票價）',
                child: '¥（可填入小孩來回票價）'
            },
            {
                title: '靜鐵 新靜岡站 ↔ 日本平口站',
                adult: '¥（可填入大人來回票價）',
                child: '¥（可填入小孩來回票價）'
            }
        ]
    },
    'day2-spot': {
        title: 'Day 2 景點票：日本平纜車',
        sections: [
            {
                title: '',
                adult: '¥（可填入日本平纜車大人票價）',
                child: '¥（可填入日本平纜車小孩票價）'
            }
        ]
    },
    'day3-transport': {
        title: 'Day 3 交通票：靜岡市區',
        sections: [
            {
                title: '靜鐵 靜岡站 ↔ 新靜岡站',
                adult: '¥（可填入大人來回票價）',
                child: '¥（可填入小孩來回票價）'
            }
        ]
    },
    'day3-spot': {
        title: 'Day 3 景點票：駿府城公園',
        sections: [
            {
                title: '',
                adult: '免費（外圍參觀）',
                child: '免費'
            }
        ]
    },
    'day4-transport': {
        title: 'Day 4 交通票：久能山東照宮',
        sections: [
            {
                title: 'JR 靜岡站 ↔ 東田子の浦站 + 纜車',
                adult: '¥（可填入大人單程 / 來回票價）',
                child: '¥（可填入小孩單程 / 來回票價）'
            }
        ]
    },
    'day4-spot': {
        title: 'Day 4 景點票：久能山東照宮',
        sections: [
            {
                title: '',
                adult: '¥500（可填入大人門票）',
                child: '¥200（可填入小孩門票）'
            }
        ]
    },
    'day5-transport': {
        title: 'Day 5 交通票：靜岡 → 機場',
        sections: [
            {
                title: '',
                adult: '¥（可填入機場巴士 / 計程車大人票價）',
                child: '¥（可填入機場巴士 / 計程車小孩票價）'
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
