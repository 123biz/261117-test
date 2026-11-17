// 앱(PWA) 등록과 설치 안내. 설치 안내는 모바일에서만 띄운다.
(function () {
  const HIDE_KEY = 'install-hidden-until';
  const HIDE_DAYS = 7; // "나중에"를 누르면 7일 동안 다시 묻지 않음

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.error('서비스 워커 등록 실패:', err));
  }

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1);
  const isMobile = navigator.userAgentData ? navigator.userAgentData.mobile : isIOS || /Android|Mobi/i.test(ua);
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  if (!isMobile || isInstalled || isHiddenNow()) return; // PC, 이미 설치됨, 최근에 거절함 → 안 띄움

  const banner = document.getElementById('install-banner');
  const text = document.getElementById('install-text');
  const yes = document.getElementById('install-yes');
  const no = document.getElementById('install-no');
  let deferred = null;

  // 안드로이드(크롬·삼성인터넷): 브라우저가 설치 가능하다고 알려주면 배너 표시
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    banner.hidden = false;
  });

  // 아이폰(사파리): 설치 버튼이 없으므로 방법을 안내
  if (isIOS) {
    text.textContent = '하단 공유 버튼 → "홈 화면에 추가"를 누르면 앱으로 설치됩니다.';
    yes.hidden = true;
    no.textContent = '닫기';
    banner.hidden = false;
  }

  yes.addEventListener('click', async () => {
    if (!deferred) return;
    banner.hidden = true;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
  });

  no.addEventListener('click', () => {
    banner.hidden = true;
    try {
      localStorage.setItem(HIDE_KEY, String(Date.now() + HIDE_DAYS * 86400000));
    } catch (err) {
      // 저장이 막힌 브라우저면 이번 방문에만 숨김
    }
  });

  window.addEventListener('appinstalled', () => { banner.hidden = true; });

  function isHiddenNow() {
    try {
      return Date.now() < Number(localStorage.getItem(HIDE_KEY) || 0);
    } catch (err) {
      return false;
    }
  }
})();
