const STORE_KEY = "yulimBuyerOS_v1";
const sample = {
  products:[
    {id:1,name:"업무용 노트북 14인치",category:"IT 장비",supplier:"부산테크솔루션",price:1250000,spec:"RAM 16GB / SSD 512GB",note:"업무용 표준 모델"},
    {id:2,name:"업무용 노트북 15인치",category:"IT 장비",supplier:"스마트오피스",price:1390000,spec:"RAM 32GB / SSD 512GB",note:"고성능 모델"},
    {id:3,name:"27인치 모니터",category:"IT 장비",supplier:"부산테크솔루션",price:289000,spec:"QHD / IPS",note:"사무용 모니터"},
    {id:4,name:"복합기 임대 패키지",category:"사무기기",supplier:"프린트파트너",price:89000,spec:"월 임대료 / 기본 유지보수",note:"월 기준"}
  ],
  purchases:[
    {id:101,item:"업무용 노트북 14인치",dept:"경영지원팀",qty:3,budget:3900000,status:"검토 중",date:"2026-11-10"},
    {id:102,item:"27인치 모니터",dept:"영업팀",qty:4,budget:1200000,status:"승인 완료",date:"2026-11-08"}
  ],
  suppliers:[
    {id:201,name:"부산테크솔루션",contact:"051-000-0000",category:"IT 장비",memo:"샘플 업체 정보"},
    {id:202,name:"스마트오피스",contact:"051-111-1111",category:"사무기기",memo:"샘플 업체 정보"},
    {id:203,name:"프린트파트너",contact:"051-222-2222",category:"복합기·프린터",memo:"샘플 업체 정보"}
  ],
  tracked:[]
};
let data = loadData();
data.rfqs = data.rfqs || [];
data.quotes = data.quotes || [];
data.orders = data.orders || [];
let currentPage = "dashboard";
let selectedProductIds = new Set();
const pageNames = {dashboard:"구매 대시보드",assistant:"AI 구매 상담",products:"상품 탐색",compare:"상품 비교",tracker:"가격 추적",procurement:"기업 구매 관리",rfq:"견적 요청 센터",suppliers:"공급업체 관리",reports:"분석 리포트"};
function loadData(){try{return JSON.parse(localStorage.getItem(STORE_KEY))||structuredClone(sample)}catch(e){return JSON.parse(JSON.stringify(sample))}}
function save(){localStorage.setItem(STORE_KEY,JSON.stringify(data))}
function money(n){return new Intl.NumberFormat("ko-KR").format(Number(n)||0)+"원"}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2300)}
function head(title,desc,action=""){return `<div class="page-head"><div><h1>${title}</h1><p>${desc}</p></div>${action}</div>`}
function stat(label,value,foot){return `<div class="card"><div class="stat-label">${label}</div><div class="stat-value">${value}</div><div class="stat-foot">${foot}</div></div>`}
function table(headers,rows){return `<div class="table-wrap"><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${rows||`<tr><td colspan="${headers.length}" class="muted">등록된 데이터가 없습니다.</td></tr>`}</tbody></table></div>`}
function render(){
 document.getElementById("pageTitle").textContent=pageNames[currentPage];
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===currentPage));
 const views={dashboard:dashboard,assistant:assistant,products:products,compare:compare,tracker:tracker,procurement:procurement,rfq:rfq,suppliers:suppliers,reports:reports};
 document.getElementById("pageContent").innerHTML=views[currentPage]();
 document.getElementById("sidebar").classList.remove("open");
}
function dashboard(){
 const spend=data.purchases.reduce((s,p)=>s+(Number(p.budget)||0),0);
 const pending=data.purchases.filter(p=>p.status!=="승인 완료").length;
 return `${head("기업 구매 현황","조직의 구매 흐름과 비용을 한눈에 확인하세요.",`<button class="btn btn-primary" onclick="go('procurement')">＋ 구매 등록</button>`)}
 <div class="grid stats">${stat("등록 상품",data.products.length+"개","비교 가능한 상품 데이터")}${stat("구매 요청",data.purchases.length+"건","전체 구매 요청")}${stat("검토 대기",pending+"건","승인 상태 확인 필요")}${stat("등록 예산",money(spend),"구매 요청에 입력된 예산 합계")}</div>
 <div class="grid two-col"><div class="card"><h3 class="card-title">최근 구매 요청</h3>${table(["품목","부서","수량","예산","상태"],data.purchases.slice(-5).reverse().map(p=>`<tr><td><b>${esc(p.item)}</b></td><td>${esc(p.dept)}</td><td>${p.qty}</td><td>${money(p.budget)}</td><td><span class="status ${p.status==="승인 완료"?"done":"wait"}">${esc(p.status)}</span></td></tr>`).join(""))}</div>
 <div class="card"><h3 class="card-title">빠른 실행</h3><div class="grid"><button class="quick" onclick="go('assistant')"><div class="q-icon">✦</div><b>구매 조건 상담</b><small>필요한 품목과 예산을 정리합니다.</small></button><button class="quick" onclick="go('compare')"><div class="q-icon">⇄</div><b>상품 비교</b><small>가격과 사양을 나란히 비교합니다.</small></button><button class="quick" onclick="go('rfq')"><div class="q-icon">✉</div><b>견적 요청서 작성</b><small>공급업체에 보낼 요청서를 만듭니다.</small></button></div></div></div>
 <p class="footer-note">※ 화면의 샘플 데이터는 기능 확인용 예시입니다. 실제 회사 데이터로 사용하기 전 샘플을 삭제하고 백업 정책을 마련하세요.</p>`;
}
function assistant(){return `${head("AI 구매 상담","AI 연결 전 단계의 구매 조건 정리 도구입니다. 입력한 조건을 바탕으로 적합한 등록 상품을 찾아드립니다.")}
 <div class="card"><h3 class="card-title">구매 조건 입력</h3><div class="form-grid"><div class="field"><label>구매 품목 / 용도</label><input id="need" placeholder="예: 사무용 노트북 3대"></div><div class="field"><label>예산 상한 (원)</label><input id="budget" type="number" placeholder="예: 4000000"></div><div class="field"><label>중요한 조건</label><select id="priority"><option value="price">가격 우선</option><option value="spec">성능·사양 우선</option><option value="balanced">가격과 성능 균형</option></select></div><div class="field"><label>희망 구매 시기</label><input id="when" placeholder="예: 이번 달"></div></div><div class="actions"><button class="btn btn-primary" onclick="advise()">구매 조건 분석</button></div><div id="adviceResult" style="margin-top:16px"></div></div>
 <p class="footer-note">현재는 외부 생성형 AI를 호출하지 않습니다. 실제 AI 상담은 향후 API 연결과 운영비 검토 후 추가할 수 있습니다.</p>`}
function advise(){const need=document.getElementById("need").value.trim(),budget=Number(document.getElementById("budget").value),priority=document.getElementById("priority").value;if(!need){toast("구매 품목을 입력해 주세요.");return}let list=data.products.filter(p=>p.name.toLowerCase().includes(need.toLowerCase())||p.category.toLowerCase().includes(need.toLowerCase())||need.toLowerCase().includes(p.category.toLowerCase()));if(budget)list=list.filter(p=>p.price<=budget);if(priority==="price")list.sort((a,b)=>a.price-b.price);if(priority==="spec")list.sort((a,b)=>b.spec.length-a.spec.length);document.getElementById("adviceResult").innerHTML=`<div class="result-box"><b>구매 조건 정리</b><p>요청 품목: ${esc(need)} · 예산: ${budget?money(budget):"미지정"} · 우선순위: ${priority==="price"?"가격":priority==="spec"?"사양":"균형"}</p><b>등록 데이터 기준 추천 후보 ${list.length}개</b>${list.length?list.map(p=>`<p>• ${esc(p.name)} — ${money(p.price)} / ${esc(p.spec)}</p>`).join(""):"<p>조건에 맞는 등록 상품이 없습니다. 상품 탐색에서 상품을 추가해 주세요.</p>"}</div>`}
function products(){return `${head("상품 탐색","구매 후보 상품을 등록하고 검색합니다.",`<button class="btn btn-primary" onclick="showProductForm()">＋ 상품 등록</button>`)}<div class="card"><input class="search-input" id="productSearch" placeholder="상품명, 카테고리, 공급업체 검색..." oninput="filterProducts()"><div id="productTable" style="margin-top:14px">${productTable()}</div></div><div id="productForm"></div>`}
function productTable(){return table(["비교","상품명","분류","공급업체","가격","사양"],data.products.map(p=>`<tr><td><input class="compare-check" type="checkbox" value="${p.id}" ${selectedProductIds.has(p.id)?"checked":""} onchange="toggleCompare(${p.id},this.checked)" aria-label="비교 선택"></td><td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td><td>${esc(p.supplier)}</td><td>${money(p.price)}</td><td>${esc(p.spec)}</td></tr>`).join(""))}
function filterProducts(){const q=document.getElementById("productSearch").value.toLowerCase();const rows=data.products.filter(p=>[p.name,p.category,p.supplier,p.spec].join(" ").toLowerCase().includes(q));document.getElementById("productTable").innerHTML=table(["비교","상품명","분류","공급업체","가격","사양"],rows.map(p=>`<tr><td><input class="compare-check" type="checkbox" value="${p.id}" ${selectedProductIds.has(p.id)?"checked":""} onchange="toggleCompare(${p.id},this.checked)"></td><td><b>${esc(p.name)}</b></td><td>${esc(p.category)}</td><td>${esc(p.supplier)}</td><td>${money(p.price)}</td><td>${esc(p.spec)}</td></tr>`).join(""))}
function showProductForm(){document.getElementById("productForm").innerHTML=`<div class="card" style="margin-top:14px"><h3 class="card-title">상품 등록</h3><div class="form-grid"><div class="field"><label>상품명</label><input id="pName"></div><div class="field"><label>분류</label><input id="pCat" placeholder="예: IT 장비"></div><div class="field"><label>공급업체</label><input id="pSupplier"></div><div class="field"><label>가격 (원)</label><input id="pPrice" type="number"></div><div class="field full"><label>사양 / 메모</label><input id="pSpec"></div></div><div class="actions"><button class="btn btn-primary" onclick="addProduct()">저장</button><button class="btn btn-outline" onclick="document.getElementById('productForm').innerHTML=''">취소</button></div></div>`}
function addProduct(){let name=document.getElementById("pName").value.trim();if(!name){toast("상품명을 입력해 주세요.");return}data.products.push({id:Date.now(),name,category:document.getElementById("pCat").value,supplier:document.getElementById("pSupplier").value,price:Number(document.getElementById("pPrice").value),spec:document.getElementById("pSpec").value});save();render();toast("상품을 등록했습니다.")}
function toggleCompare(id,checked){if(checked)selectedProductIds.add(id);else selectedProductIds.delete(id)}
function compare(){return `${head("상품 비교","상품 탐색에서 비교할 상품을 체크한 뒤 아래에서 비교하세요.")}<div class="card"><p class="muted">상품 탐색 메뉴에서 비교 체크박스를 선택하면 비교 목록에 표시됩니다.</p><div class="actions"><button class="btn btn-primary" onclick="renderComparison()">선택 상품 비교하기</button></div><div id="compareResult" style="margin-top:16px"></div></div>`}
function renderComparison(){let chosen=data.products.filter(p=>selectedProductIds.has(p.id));document.getElementById("compareResult").innerHTML=chosen.length?table(["상품명","공급업체","가격","사양","메모"],chosen.map(p=>`<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.supplier)}</td><td>${money(p.price)}</td><td>${esc(p.spec)}</td><td>${esc(p.note||"")}</td></tr>`).join("")):`<div class="empty">비교할 상품을 먼저 선택해 주세요.</div>`}
function tracker(){return `${head("가격 추적 관리","관심 상품의 목표 가격과 확인 가격을 기록합니다.",`<button class="btn btn-primary" onclick="addTrack()">＋ 가격 기록</button>`)}<div class="card"><p class="muted">가격 추적은 직접 입력한 가격 이력을 관리합니다. 외부 쇼핑몰 가격을 자동 수집하지 않습니다.</p>${table(["상품","확인 가격","목표 가격","확인일","메모"],data.tracked.map(t=>`<tr><td>${esc(t.item)}</td><td>${money(t.price)}</td><td>${money(t.target)}</td><td>${esc(t.date)}</td><td>${esc(t.memo)}</td></tr>`).join(""))}</div>`}
function addTrack(){let item=prompt("상품명");if(!item)return;let price=Number(prompt("현재 확인 가격(숫자)","0"));let target=Number(prompt("목표 가격(숫자)","0"));data.tracked.push({item,price,target,date:new Date().toISOString().slice(0,10),memo:price<=target?"목표 가격 이하":"목표 가격 초과"});save();render();toast("가격 기록을 저장했습니다.")}
function procurement(){
 const stages=["검토 중","견적 수집 중","승인 완료","발주 완료","납품 완료","반려"];
 return `${head("기업 구매 관리","구매 요청부터 승인·발주·납품까지 진행 상태를 관리합니다.",`<button class="btn btn-primary" onclick="showPurchaseForm()">＋ 구매 요청 등록</button>`)}
 <div class="card"><h3 class="card-title">구매 요청 현황</h3>${table(["요청일","품목","부서","수량","예산","진행 상태","관리"],data.purchases.map(p=>`<tr><td>${esc(p.date)}</td><td><b>${esc(p.item)}</b></td><td>${esc(p.dept)}</td><td>${p.qty}</td><td>${money(p.budget)}</td><td><span class="status ${p.status==="납품 완료"?"done":p.status==="반려"?"":"wait"}">${esc(p.status)}</span></td><td><button class="btn btn-soft" onclick="cycleStatus(${p.id})">다음 단계</button></td></tr>`).join(""))}</div>
 <div class="card" style="margin-top:16px"><h3 class="card-title">발주 관리</h3>${table(["발주일","품목","공급업체","수량","발주 금액","상태","관리"],data.orders.map(o=>`<tr><td>${esc(o.date)}</td><td><b>${esc(o.item)}</b></td><td>${esc(o.supplier)}</td><td>${o.qty}</td><td>${money(o.amount)}</td><td><span class="status ${o.status==="납품 완료"?"done":"wait"}">${esc(o.status)}</span></td><td><button class="btn btn-soft" onclick="cycleOrder(${o.id})">상태 변경</button></td></tr>`).join(""))}</div>
 <div id="purchaseForm"></div>`;
}
function showPurchaseForm(){document.getElementById("purchaseForm").innerHTML=`<div class="card" style="margin-top:14px"><h3 class="card-title">구매 요청 등록</h3><div class="form-grid"><div class="field"><label>품목</label><input id="buyItem"></div><div class="field"><label>요청 부서</label><input id="buyDept"></div><div class="field"><label>수량</label><input id="buyQty" type="number" min="1" value="1"></div><div class="field"><label>예산 (원)</label><input id="buyBudget" type="number" min="0"></div></div><div class="actions"><button class="btn btn-primary" onclick="addPurchase()">요청 저장</button></div></div>`}
function addPurchase(){let item=document.getElementById("buyItem").value.trim();if(!item){toast("품목을 입력해 주세요.");return}data.purchases.push({id:Date.now(),item,dept:document.getElementById("buyDept").value,qty:Number(document.getElementById("buyQty").value)||1,budget:Number(document.getElementById("buyBudget").value)||0,status:"검토 중",date:new Date().toISOString().slice(0,10)});save();render();toast("구매 요청을 저장했습니다.")}
function cycleStatus(id){let p=data.purchases.find(x=>x.id===id);let states=["검토 중","견적 수집 중","승인 완료","발주 완료","납품 완료","반려"];p.status=states[(states.indexOf(p.status)+1)%states.length];save();render()}
function cycleOrder(id){let o=data.orders.find(x=>x.id===id);let states=["발주 대기","발주 완료","납품 완료","취소"];o.status=states[(states.indexOf(o.status)+1)%states.length];save();render()}
function rfq(){
 return `${head("견적 요청 센터","견적 요청서를 저장하고 공급업체별 회신 가격을 비교합니다.") }
 <div class="grid two-col">
  <div class="card"><h3 class="card-title">새 견적 요청 등록</h3>
   <div class="form-grid">
    <div class="field"><label>요청 품목</label><input id="rfqItem" placeholder="예: 업무용 노트북"></div>
    <div class="field"><label>수량</label><input id="rfqQty" type="number" min="1" value="1"></div>
    <div class="field"><label>요청 부서</label><input id="rfqDept" placeholder="예: 경영지원팀"></div>
    <div class="field"><label>회신 희망일</label><input id="rfqDue" type="date"></div>
    <div class="field full"><label>상세 사양 및 요청사항</label><textarea id="rfqDetail" placeholder="필요 사양, 납품 장소, 보증 조건 등을 입력하세요."></textarea></div>
   </div>
   <div class="actions"><button class="btn btn-primary" onclick="saveRFQ()">견적 요청 저장</button></div>
  </div>
  <div class="card"><h3 class="card-title">공급업체 견적 등록</h3>
   <div class="form-grid">
    <div class="field full"><label>견적 요청 선택</label><select id="quoteRfq">${data.rfqs.map(r=>`<option value="${r.id}">${esc(r.item)} · ${esc(r.dept)}</option>`).join("")}</select></div>
    <div class="field"><label>공급업체</label><input id="quoteSupplier" list="supplierNames" placeholder="업체명"><datalist id="supplierNames">${data.suppliers.map(x=>`<option value="${esc(x.name)}">`).join("")}</datalist></div>
    <div class="field"><label>견적 금액 (원)</label><input id="quotePrice" type="number" min="0" placeholder="예: 1250000"></div>
    <div class="field"><label>예상 납기</label><input id="quoteDelivery" placeholder="예: 발주 후 7일"></div>
    <div class="field"><label>보증 조건</label><input id="quoteWarranty" placeholder="예: 1년 무상"></div>
   </div>
   <div class="actions"><button class="btn btn-primary" onclick="saveQuote()" ${data.rfqs.length?"":"disabled"}>견적 회신 저장</button></div>
   <p class="footer-note">공급업체의 실제 회신 내용을 직접 입력하는 방식입니다. 자동 이메일 발송은 아직 연결되지 않았습니다.</p>
  </div>
 </div>
 <div class="card" style="margin-top:16px"><h3 class="card-title">견적 요청 목록</h3>
 ${table(["등록일","품목","부서","수량","희망 회신일","견적 수","관리"],data.rfqs.map(r=>`<tr><td>${esc(r.date)}</td><td><b>${esc(r.item)}</b></td><td>${esc(r.dept)}</td><td>${r.qty}</td><td>${esc(r.due||"-")}</td><td>${data.quotes.filter(q=>q.rfqId===r.id).length}건</td><td><button class="btn btn-soft" onclick="showQuotes(${r.id})">견적 비교</button></td></tr>`).join(""))}
 <div id="quoteCompare" style="margin-top:14px"></div></div>`;
}
function saveRFQ(){
 const item=document.getElementById("rfqItem").value.trim();
 if(!item){toast("요청 품목을 입력해 주세요.");return}
 data.rfqs.push({id:Date.now(),item,qty:Number(document.getElementById("rfqQty").value)||1,dept:document.getElementById("rfqDept").value,due:document.getElementById("rfqDue").value,detail:document.getElementById("rfqDetail").value,date:new Date().toISOString().slice(0,10),status:"견적 수집 중"});
 save();render();toast("견적 요청을 저장했습니다.");
}
function saveQuote(){
 const rfqId=Number(document.getElementById("quoteRfq").value),supplier=document.getElementById("quoteSupplier").value.trim(),price=Number(document.getElementById("quotePrice").value);
 if(!rfqId){toast("먼저 견적 요청을 등록해 주세요.");return}
 if(!supplier||!price){toast("공급업체와 견적 금액을 입력해 주세요.");return}
 data.quotes.push({id:Date.now(),rfqId,supplier,price,delivery:document.getElementById("quoteDelivery").value,warranty:document.getElementById("quoteWarranty").value,date:new Date().toISOString().slice(0,10)});
 save();render();toast("공급업체 견적을 저장했습니다.");
}
function showQuotes(id){
 const r=data.rfqs.find(x=>x.id===id),qs=data.quotes.filter(x=>x.rfqId===id).sort((a,b)=>a.price-b.price);
 const el=document.getElementById("quoteCompare");
 el.innerHTML=`<h3 class="card-title">${esc(r.item)} — 공급업체 견적 비교</h3>${qs.length?table(["공급업체","견적 금액","납기","보증 조건","등록일","선택"],qs.map((q,i)=>`<tr><td><b>${esc(q.supplier)}</b>${i===0?` <span class="status done">최저 견적</span>`:""}</td><td>${money(q.price)}</td><td>${esc(q.delivery||"-")}</td><td>${esc(q.warranty||"-")}</td><td>${esc(q.date)}</td><td><button class="btn btn-soft" onclick="createOrder(${r.id},${q.id})">이 견적으로 발주</button></td></tr>`).join("")):`<div class="empty">아직 등록된 견적이 없습니다. 공급업체 회신을 입력해 주세요.</div>`}`;
}
function createOrder(rfqId,quoteId){
 const r=data.rfqs.find(x=>x.id===rfqId),q=data.quotes.find(x=>x.id===quoteId);
 if(!confirm(`${q.supplier}의 ${money(q.price)} 견적을 발주 대기 목록에 등록할까요?`))return;
 data.orders.push({id:Date.now(),rfqId,quoteId,item:r.item,qty:r.qty,supplier:q.supplier,amount:q.price,status:"발주 대기",date:new Date().toISOString().slice(0,10)});
 r.status="발주 대기";save();toast("발주 대기 목록에 등록했습니다.");go("procurement");
}
function suppliers(){return `${head("공급업체 관리","공급업체 연락처와 취급 분야를 관리합니다.",`<button class="btn btn-primary" onclick="addSupplier()">＋ 업체 등록</button>`)}<div class="card">${table(["업체명","연락처","취급 분야","메모"],data.suppliers.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.contact)}</td><td>${esc(s.category)}</td><td>${esc(s.memo)}</td></tr>`).join(""))}</div>`}
function addSupplier(){let name=prompt("업체명");if(!name)return;let contact=prompt("연락처","");let category=prompt("취급 분야","");data.suppliers.push({id:Date.now(),name,contact,category,memo:""});save();render();toast("공급업체를 등록했습니다.")}
function reports(){let total=data.purchases.reduce((s,p)=>s+(Number(p.budget)||0),0),approved=data.purchases.filter(p=>p.status==="승인 완료"||p.status==="발주 완료"||p.status==="납품 완료").length;let byDept={};data.purchases.forEach(p=>byDept[p.dept||"미지정"]=(byDept[p.dept||"미지정"]||0)+(Number(p.budget)||0));return `${head("구매 분석 리포트","현재 브라우저에 저장된 구매 요청 데이터를 요약합니다.",`<button class="btn btn-outline" onclick="exportCSV()">CSV 내보내기</button>`)}<div class="grid stats">${stat("구매 요청 예산",money(total),"등록된 요청 예산 합계")}${stat("승인 완료",approved+"건","현재 승인 완료 건수")}${stat("공급업체",data.suppliers.length+"곳","등록된 업체")}${stat("가격 추적",data.tracked.length+"건","직접 기록한 가격")}${stat("발주 건수",data.orders.length+"건","견적에서 생성된 발주")}</div><div class="card"><h3 class="card-title">부서별 요청 예산</h3>${Object.entries(byDept).length?Object.entries(byDept).map(([dept,val])=>`<div style="margin:15px 0"><div style="display:flex;justify-content:space-between"><b>${esc(dept)}</b><span>${money(val)}</span></div><div class="bar"><i style="width:${Math.max(4,total?val/total*100:0)}%"></i></div></div>`).join(""):`<div class="empty">분석할 구매 데이터가 없습니다.</div>`}</div><p class="footer-note">절감액은 비교 기준 가격과 실제 구매 가격이 검증된 경우에만 계산해야 합니다. 현재 샘플에는 검증된 절감 실적이 포함되어 있지 않습니다.</p>`}
function go(page){currentPage=page;render()}
function exportAll(){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});download(blob,"yulim-buyer-backup.json");toast("전체 데이터를 백업했습니다.")}
function exportCSV(){let rows=[["요청일","품목","부서","수량","예산","상태"],...data.purchases.map(p=>[p.date,p.item,p.dept,p.qty,p.budget,p.status])];let csv="\\uFEFF"+rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\\n");download(new Blob([csv],{type:"text/csv;charset=utf-8"}),"yulim-purchases.csv");}
function download(blob,name){let a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href)}
document.getElementById("mainNav").addEventListener("click",e=>{let b=e.target.closest("[data-page]");if(b)go(b.dataset.page)});
document.getElementById("exportAll").addEventListener("click",exportAll);
document.getElementById("mobileMenu").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
render();
