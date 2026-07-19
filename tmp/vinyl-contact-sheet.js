// Временный служебный скрипт для создания контактных листов из публичной папки Яндекс Диска.
(async () => {
  const PUBLIC_KEY = 'https://disk.yandex.ru/d/vZHyxEHgA0JNVQ';
  const params = new URLSearchParams(window.location.search);
  const folderNumber = params.get('folder') || '1';
  const offset = Number(params.get('offset') || '0');
  const limit = Math.min(Number(params.get('limit') || '20'), 30);
  const folderPath = `/Винил ${folderNumber}`;

  document.head.innerHTML = `
    <meta charset="utf-8">
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 20px; background: #f4f4f4; color: #111; font-family: Arial, sans-serif; }
      h1 { margin: 0 0 14px; font-size: 24px; }
      .status { margin-bottom: 14px; font-size: 15px; }
      .grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
      .card { min-width: 0; background: #fff; border: 1px solid #ccc; border-radius: 8px; padding: 7px; overflow: hidden; }
      .card img { width: 100%; height: 190px; display: block; object-fit: contain; background: #e8e8e8; }
      .index { margin-top: 6px; font-size: 15px; font-weight: 700; }
      .name { margin-top: 3px; font-size: 9px; color: #555; overflow-wrap: anywhere; }
      .error { white-space: pre-wrap; color: #a00; font-size: 16px; }
    </style>`;
  document.body.innerHTML = `<h1>${folderPath}: фотографии ${offset + 1}–${offset + limit}</h1><div class="status">Загрузка…</div><div class="grid"></div>`;

  const apiParams = new URLSearchParams({
    public_key: PUBLIC_KEY,
    path: folderPath,
    offset: String(offset),
    limit: String(limit),
    preview_size: 'XL',
    preview_crop: 'false',
    fields: '_embedded.total,_embedded.items.name,_embedded.items.path,_embedded.items.preview,_embedded.items.mime_type'
  });

  try {
    const response = await fetch(`https://cloud-api.yandex.net/v1/disk/public/resources?${apiParams}`);
    if (!response.ok) throw new Error(`API ${response.status}: ${await response.text()}`);
    const data = await response.json();
    const items = data?._embedded?.items || [];
    const total = data?._embedded?.total ?? '?';
    document.querySelector('.status').textContent = `Всего файлов: ${total}. Показан диапазон ${offset + 1}–${offset + items.length}.`;

    const grid = document.querySelector('.grid');
    const loadPromises = [];
    items.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      img.alt = item.name || '';
      img.src = item.preview || '';
      const loadPromise = new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 8000);
      });
      loadPromises.push(loadPromise);
      card.appendChild(img);
      card.insertAdjacentHTML('beforeend', `<div class="index">№ ${offset + i + 1}</div><div class="name">${item.name || ''}</div>`);
      grid.appendChild(card);
    });
    await Promise.all(loadPromises);
    document.body.dataset.ready = 'true';
  } catch (error) {
    document.body.innerHTML = `<div class="error">${String(error?.stack || error)}</div>`;
    document.body.dataset.ready = 'error';
  }
})();