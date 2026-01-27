// --- IMPORTANTE: Mude este número a cada Deploy (v14, v15, v16...) ---
const CACHE_NAME = 'biblia-sagrada-v42';

// Lista de arquivos
const urlsToCache = [
  './biblia.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './harpa.json',
  './cantor.json',
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

// 1. INSTALAÇÃO: Baixa os arquivos e força a instalação imediata
self.addEventListener('install', event => {
  // O "Pulo do Gato 1": Força o SW novo a entrar, sem esperar o velho fechar
  self.skipWaiting(); 

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto: ' + CACHE_NAME);
        return Promise.all(
            urlsToCache.map(url => {
                // 'no-cache' garante que baixamos a versão real do GitHub, não do cache do browser
                return fetch(url, {cache: 'no-cache'}).then(response => {
                    return cache.put(url, response);
                }).catch(err => {
                    console.log('Erro ao cachear (pode ser opcional): ' + url);
                });
            })
        );
      })
  );
});

// 2. ATIVAÇÃO: Limpa caches antigos e assume o controle da tela
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // O "Pulo do Gato 2": Assume o controle da página aberta imediatamente
      return self.clients.claim(); 
    })
  );
});

// 3. FETCH: Serve o conteúdo
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
