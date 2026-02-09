// --- IMPORTANTE: Mude este número a cada Deploy ---
const CACHE_NAME = 'biblia-sagrada-v62'; // Mudei para v62 para forçar nova tentativa

// Lista de arquivos OBRIGATÓRIOS
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './static/icons/icon-192.png',
  './static/icons/icon-512.png',
  './harpa.json',
  'harpa.json',
  './cantor_cristao.json', // Este arquivo TEM de estar na pasta raiz
  'cantor_cristao.json',
  './cantor.json',         // Verifique se você usa mesmo este arquivo, senão remova
  './NVI.json',
  './NVT.json',
  './ACF.json',
  './ARA.json',
  './ARC.json',
  './TB.json',
  './KJA.json',
  './NAA.json',
  './JFA.json',
  './NBV.json',
  './NTLH.json',
  './AS21.json',
  './KJF.json'
];

// 1. INSTALAÇÃO RIGOROSA
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async cache => {
        console.log('A tentar cachear arquivos essenciais...');
        
        // Usamos um loop for...of para poder tratar erros corretamente com async/await
        try {
          for (const url of urlsToCache) {
            // fetch com cache: 'reload' força o download da rede, ignorando cache do browser
            const response = await fetch(url, { cache: 'reload' });
            
            if (!response.ok) {
              throw new Error(`Erro ao baixar ${url}: Status ${response.status}`);
            }
            
            await cache.put(url, response);
          }
          console.log('✅ Todos os arquivos foram cacheados com sucesso!');
        } catch (error) {
          console.error('❌ FALHA CRÍTICA NA INSTALAÇÃO:', error);
          // Se der erro aqui, a promessa falha e o SW não instala (o que é bom, pois evita cache incompleto)
          throw error;
        }
      })
  );
});

// 2. ATIVAÇÃO (Limpeza)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// 3. FETCH (Interceptação)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se achou no cache, retorna. Se não, busca na rede.
        return response || fetch(event.request);
      })
  );
});
