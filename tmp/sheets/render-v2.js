// Временный компактный рендер контактных листов.
(async () => {
  const cfg = window.VINYL_CONFIG || { folder: 1, offset: 0, limit: 30 };
  const folderPath = `/Винил ${cfg.folder}`;
  document.head.innerHTML = `<meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;padding:10px;background:#f3f3f3;color:#111;font-family:Arial,sans-serif}
    h1{margin:0 0 5px;font-size:20px}.status{margin-bottom:6px;font-size:12px}
    .grid{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:6px}
    .card{min-width:0;background:#fff;border:1px solid #bbb;border-radius:5px;padding:4px;overflow:hidden}
    .card img{width:100%;height:160px;display:block;object-fit:contain;background:#e5e5e5}
    .index{margin-top:3px;font-size:12px;font-weight:700}.name{margin-top:1px;font-size:6px;color:#555;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  </style>`;
  document.body.innerHTML = `<h1>${folderPath}: фото ${cfg.offset + 1}–${cfg.offset + cfg.limit}</h1><div class="status">Загрузка…</div><div class="grid"></div>`;
  const api = new URL('https://cloud-api.yandex.net/v1/disk/public/resources');
  api.search = new URLSearchParams({public_key:'https://disk.yandex.ru/d/vZHyxEHgA0JNVQ',path:folderPath,offset:String(cfg.offset),limit:String(cfg.limit),preview_size:'XL',preview_crop:'false',fields:'_embedded.total,_embedded.items.name,_embedded.items.preview'});
  const response = await fetch(api);
  if (!response.ok) throw new Error(`Yandex API ${response.status}`);
  const data = await response.json();
  const items = data?._embedded?.items || [];
  document.querySelector('.status').textContent = `Всего: ${data?._embedded?.total ?? '?'}. Показано: ${items.length}.`;
  const grid = document.querySelector('.grid');
  const loaded=[];
  items.forEach((item,i)=>{
    const card=document.createElement('div');card.className='card';
    const img=document.createElement('img');img.alt='';img.referrerPolicy='no-referrer';
    img.src=item.preview?`https://images.weserv.nl/?url=${encodeURIComponent(item.preview)}&output=jpg&q=88`:'';
    loaded.push(new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;setTimeout(resolve,10000);}));
    card.appendChild(img);
    card.insertAdjacentHTML('beforeend',`<div class="index">№ ${cfg.offset+i+1}</div><div class="name">${item.name||''}</div>`);
    grid.appendChild(card);
  });
  await Promise.all(loaded);
})().catch(error=>{document.body.innerHTML=`<pre>${String(error?.stack||error)}</pre>`;});