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
    
    setTimeout(() => {
        initRouteMap();
    }, 100);
};

const dayDetails = {
    day1: '【交通】\n• [1F 機場接駁車] (Green Car) T2 [BusStop 9] ↔ T3 [BusStop 0]\n• [2F 東京單軌電車 Monorail] (MO08) 羽田機場第2航廈 → (MO02) 天王洲島站 Tennozu Isle\n• 「第2月台」或「濱松町（JR山手線・東京都心方面）」指標前往第2月台候車\n• [Walk] 天王洲島站 → 東橫INN\n\n【備案】\n※ 備案1-1：京急線 [羽田機場] → [品川車站]（約 25 分）\n※ 備案1-2：飯店免費接駁車 [品川車站] → [品川東橫INN]（約 10 分）',
    day2: '【交通】\n• [臨海線（りんかい線）] (天王洲) ↔ (東京テレポート) = 台場\n• [飯店接駁車] (品川東橫INN) → (JR品川站)\n• [品川站・東海道新幹線] Hikari 717 15:10 (品川) → (靜岡)（約 52 分）\n\n【備選】\n※ Kodama 回聲號 15:34 發 → 16:47 抵',
    day3: '【交通手段】\n自駕（需國際駕照）\n\n【行程】\n1）富士山樂座\n2）白絲瀑布\n3）富士宮\n4）富士山遺產中心\n\n【住宿】\n靜鐵 Prezio 飯店 靜岡站南\n\n【餐食】\n早：飯店 / 午：富士宮炒麵',
    day4: '【交通】\n• [JR 東海道本線] (CA17 靜岡) → (CA14 清水)（往富士／熱海方向）\n• [靜鐵巴士・3番月台・三保山之手線] (清水站) → (三保松原入口)\n• [水上巴士] (水上バス 三保のりば) → (日の出) = S-Pulse Dream Plaza\n• [免費接駁巴士] (Dream Plaza) → (清水站)\n• [JR 東海道本線] (CA14 清水) → (CA17 靜岡)\n\n【景點】\n• 三保松原\n• S-Pulse Dream Plaza\n• 櫻桃小丸子樂園',
    day5: '【交通】\n• [東海道新幹線] (靜岡) → (新橫濱) Hikari 710 15:41（16:24 抵）\n※ 備選：Kodama 回聲號 15:56（16:59 抵）\n• [JR 橫濱／根岸線] (新橫濱) → (櫻木町)\n [O] 大船行/磯子行/櫻木町行, [X] 東神奈川, 橫濱 (因為還沒開到櫻木町, 要轉車)\n※ 備選：地鐵藍線',
    day6: '【交通】\n• [JR 根岸線] (櫻木町 Sakuragicho) ↔ (橫濱 Yokohama) JOINUS Shopping\n• [Walk] 飯店 → Cosmoworld (搭摩天輪)\n• [Walk] Cosmoworld → World Porters\n• [纜車 Yokohama Air Cabin] (運河公園站 Unga Park) → (櫻木町站 Sakuragicho)\n\n【景點】\n• JOINUS Shopping\n• Cosmoworld\n• World Porters',
    day7: '【前往機場】\n• JR 根岸線 [櫻木町 Sakuragicho] → [橫濱 Yokohama] + 京急電鐵 [橫濱 Yokohama] → [羽田機場]\n\n【航班】\n• [T2] ANA NH853 HND 13:20 → TPE 15:50 (T1)\n\n【備案】\n※[Walk] 飯店 → (日ノ出町駅 Hinodecho Station)\n• [京急線・Airport Express] (KK39 日ノ出町駅 Hinodecho Station) → (KK17 羽田空港第1・第2ターミナル駅 Haneda Airport Terminal 1·2 Station)\n\n【京急電鐵車種說明】\n※ Limited Express (KAITOKU 快特) \n※ Limited Express(TOKKYU 特急)\n※ Airport Express (急行 羽田空港行)\n※ ICOCA 可搭乘以上一般列車'
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

function openTransportIframeModal(e, url, title) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('transport-iframe-modal');
    const frame = document.getElementById('transport-iframe-modal-frame');
    const titleEl = document.getElementById('transport-iframe-modal-title');
    if (modal && frame && titleEl) {
        titleEl.innerText = title;
        frame.src = url;
        modal.classList.remove('hidden');
    }
}

function closeTransportIframeModal() {
    const modal = document.getElementById('transport-iframe-modal');
    const frame = document.getElementById('transport-iframe-modal-frame');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (frame) {
        frame.src = 'about:blank';
    }
}

function openTransportImageModal(e, url, title) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('transport-image-modal');
    const img = document.getElementById('transport-image-modal-img');
    const titleEl = document.getElementById('transport-image-modal-title');
    if (modal && img && titleEl) {
        titleEl.innerText = title;
        img.src = url;
        modal.classList.remove('hidden');
    }
}

function closeTransportImageModal() {
    const modal = document.getElementById('transport-image-modal');
    const img = document.getElementById('transport-image-modal-img');
    if (modal) {
        modal.classList.add('hidden');
    }
    if (img) {
        img.src = '';
    }
}

const ticketDetails = {
    'day1-transport': {
        title: 'Day 1 交通票：東京單軌電車',
        sections: [
            {
                title: '(MO08) 羽田機場T3 → (MO02) 天王洲島站 Tennozu Isle',
                adult: '¥390（IC 卡或單程票）',
                child: '¥195（IC 卡或單程票）'
            },
            
        ]
    },
	
	'day2-transport': {
        title: 'Day 2 交通票：臨海線',
        sections: [
            {
                title: '臨海線（りんかい線)： (天王洲) → (東京電訊テレポート)',
                adult: '¥210（IC 卡或單程票)',
                child: '¥105（IC 卡或單程票)'
            },
      
        ]
    },
	
		'day2-shinkansen': {
        title: 'Day 2 交通票： 新幹線 Hikari_光芒號_717 15:10（16:02 抵)',
        sections: [
     
             {
                title: '品川 → 靜岡',
                adult: '¥6,470（約 NT$1,290）',
                child: '¥3,230（約 NT$640）'
            },
      
        ]
    },
	
	'day3-drive': {
        title: 'Day 3 自駕：地址/電話',
        sections: [
            {
                title: `白絲瀑布：<br>
						富士宮市上井出273-1(白絲瀑布停車場）<br>
						<span style="background-color: yellow;">MAPCODE：72 820 177*48 </span><br>
						0544-54-2880/0544-27-5240<br><br>

						AEON Mall Fujinomiya：<br>
						静岡県富士宮市浅間町1番8号<br>
						<span style="background-color: yellow;">MAPCODE：72 493 113*74 </span><br>
						+81 544-68-7200<br><br>

						富士宮本宮淺間大社：<br>
						富士宮市宮町1-1<br>
						<span style="background-color: yellow;">MAPCODE：72 493 827*66 </span><br>
						0544-27-2002<br><br>
						
						富士山遺產中心：<br>
						富士宮市宮町5-12<br>
						<span style="background-color: yellow;">MAPCODE：72 493 403*28 </span><br>
						+81 544-21-3776<br><br>
						
						田子の浦港：<br>
						静岡県富士市鈴川町2-1<br>
						<span style="background-color: yellow;">MAPCODE：72 203 716*28 </span><br>
						+81 545-33-0495<br><br>	
						
						<a href="https://www.mapion.co.jp/" target="_blank" 
						
						  style="color: #1976d2; text-decoration: underline;"
						
						>Mapcode</a>
					
						`
					

            },
      
        ]
    },
	
	
		'day3-highway': {
        title: 'Day 3 自駕：路線',
        sections: [
            {
                title: ` [飯店靜岡站南] to [白絲瀑布]：<br>
						東名高速公路富士 IC  or 新東名高速公路新富士 IC<br><br>

						[白絲瀑布] to [AEON富士宮]：<br>
						国道139号<br><br>

						[AEON富士宮] to [田子の浦港]：<br>
						国道139号<br><br>
						
						[田子の浦港] to [飯店靜岡站南]：<br>
						東名高速公路 or 国道1号<br><br>					
						`

            },
      
        ]
    },
	
    'day4-transport': {
        title: 'Day 4 交通票：JR東海道本線/靜鐵巴士/水上巴士',
        sections: [
            {
                title: 'JR東海道本線: 靜岡站 ↔ 清水站',
                adult: '¥240（IC 卡或單程票）',
                child: '¥120（IC 卡或單程票）'
            },
            {
                title: `靜鐵巴士・3番月台・三保山之手線:<br><br> 
				**清水駅前 → 三保松原入口 
				[#57三保車庫前行き/東海大学三保水族館行き, #58世界遺産三保松原行き]; [[折戸車庫]行きはに止まりません]<br><br>
				**[三保松原入口] → [エスパルス練習場入口] 只有往[東海大学三保水族館]的車有到練習場, 可改為搭往[三保車庫前]然後用走的去搭水上巴士(約 8mins)<br><br>
				**備案: 回程找清水駅 (1號乘車處)（波止場フェルケール博物館・新清水駅経由）方向<br><br>
				大人: ¥440（IC 卡或單程票)<br>
                小孩: ¥220（IC 卡或單程票)`
            },
            {
                title: '水上巴士: 水上バス 三保のりば → 日の出',
                adult: '¥1,000（現場購票）',
                child: '¥500（現場購票）'
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
                adult: '¥1,200（官網查詢）',
                child: '¥700（官網查詢）'
            }
        ]
    },
    'day5-shinkansen': {
        title: 'Day 5 交通票： 新幹線 Hikari_光芒號_710 15:41（16:24 抵)',
        sections: [
            {
				title: '靜岡 → 新橫濱',
                adult: '¥6,470（約 NT$1,290）',
                child: '¥3,230（約 NT$640）'
            },
       
        ]
    },
    'day5-jr': {
        title: 'Day 5 交通票：JR 橫濱/根岸線',
        sections: [
            {
                title: 'JR 橫濱/根岸線 [新橫濱] → [櫻木町]',
                adult: '¥210（IC 卡）',
                child: '¥105（IC 卡）'
            },
            {
                title: '備案：市營地下鐵藍線 [新橫濱] → [櫻木町]',
                adult: '¥280（IC 卡）',
                child: '¥140（IC 卡）'
            }
        ]
    },
	
	    'day6-jr': {
        title: 'Day 6 交通票：JR 根岸線',
        sections: [
            {
				title: 'JR 根岸線 [櫻木町] ↔ [新橫濱]',
                adult: '¥210（IC 卡）',
                child: '¥105（IC 卡）'
            },
       
        ]
    },
    'day6-transport': {
        title: 'Day 6 交通票：摩天輪 COSMO CLOCK 21 + 纜車 Yokohama Air Cabin (one way)',
        sections: [
            {
                title: '摩天輪 + 單程纜車 [運河公園站 Unga Park] → (櫻木町站 Sakuragicho]',
                adult: '¥1,700（現場購票/Kkday）',
                child: '¥1,300（現場購票/Kkday）'
            },
     
        ]
    },
	
	
	
	
    'day7-keikyu': {
        title: 'Day 7 交通票：橫濱 → 羽田',
        sections: [
            {
                title: '京急線 機場特急 [日ノ出町] → [羽田機場T2]',
                adult: '¥400（IC 卡）',
                child: '¥200（IC 卡）'
            },
            {
                title: '備案：JR 根岸線 + 京急',
                adult: '¥160 + ¥400（IC 卡）',
                child: '¥80 + ¥200（IC 卡）'
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
