RANGES_SOURCE_URL = 'http://tasix.sarkor.uz/full';
RANGES_UPDATE_DAYS = 30;
FILTER_ALL_URLS = { urls: ['<all_urls>'] };
FILTER_BLOCKING = ['blocking'];

tabs = {};
domains = {};
ranges = [];

tasixMode = false;

// Spraytlar, faqat ketma-ketligi yetarli
sprites = [
  'checking',
  'no-tas-ix',
  'tas-ix',
  'tas-ix-mode'
];

// Kanvasga ikonka chiziladi, menimcha, har safar ikonkani fayldan yuklab olmaslik uchun kerak
function buildIcon(icon, size) {
  var canvas = document.getElementById('canvas-' + size);
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var spriteIndex = sprites.indexOf(icon);
  var spriteX = spriteIndex * size;

  ctx.drawImage(document.getElementById('sprites-' + size),
                spriteX, 0, size, size,
                0, 0, size, size);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function setIcon(tabId, status) {
  chrome.browserAction.setIcon({
    // 'tabId': tabId,
    'imageData': {
      '19': buildIcon(status, 19),
      '38': buildIcon(status, 38),
    }
  });
}

// Tabda ochilgan sayt tasiksda
// Tasiks ikonkasi yashilga o‘zgartiriladi
// va mos matn qo‘yiladi
function setTasixIcon(tabId) {
  setIcon(tabId, 'tas-ix');

  chrome.browserAction.setTitle({
    title: chrome.i18n.getMessage('tasix')
  });
}

// Tabda ochilgan sayt tasiksda emas
function setNotTasixIcon(tabId) {
  setIcon(tabId, 'no-tas-ix');

  chrome.browserAction.setTitle({
    title: chrome.i18n.getMessage('notasix')
  });
}

// Tekshirilyapti
function setCheckingIcon(tabId) {
  setIcon(tabId, 'checking');
}

// Faqat Tas-ix rejimi yoniq
function setTasixModeIcon(tabId) {
  setIcon(tabId, 'tas-ix-mode');

  chrome.browserAction.setTitle({
    title: chrome.i18n.getMessage('tasixmode')
  });
}

// Tabdagi asosiy so‘rovmi?
function checkTabMainRequest(details) {
  if (!details.tabId || details.tabId == -1) {
    return false;
  }

  var isMainFrame = (details.type == 'main_frame');
  if (!isMainFrame) {
    return false;
  }

  return true;
}

// So‘rov boshlanishida tekshiramiz
chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (tasixMode) {
      return;
      var domain = getDomainFromURL(details.url);
      var domainResult = domains[domain];

      if (domainResult === false) {
        return {
          cancel: true
        };
      }
    }

    if (!checkTabMainRequest(details)) {
      return;
    }

    tabs[details.tabId] = 'checking';

    var domain = getDomainFromURL(details.url);
    var domainResult = domains[domain];

    if (domainResult === true) {
      tabs[details.tabId] = 'tas-ix';
      setTasixIcon(details.tabId);
    }

    if (domainResult === false) {
      tabs[details.tabId] = 'no-tas-ix';
      setNotTasixIcon(details.tabId);
    }
  },
  FILTER_ALL_URLS,
  FILTER_BLOCKING
);

// Javob kelishida tekshiramiz
// Bu hodisada domen IP manzili aniq
chrome.webRequest.onResponseStarted.addListener(
  function (details) {
    if (tasixMode) {
      console.log(details);
      return {
        cancel: true
      };
      var domain = getDomainFromURL(details.url);
      var domainResult;

      var addr = details.ip;
      domains[domain] = domainResult = checkIp(addr);

      if (domainResult === false) {
        return {
          cancel: true
        };
      }
    }

    if (!checkTabMainRequest(details)) {
      return;
    }

    var domain = getDomainFromURL(details.url);
    var domainResult = domains[domain];

    if (domainResult !== undefined) {
      return;
    }

    var addr = details.ip;
    domains[domain] = domainResult = checkIp(addr);

    if (domainResult === true) {
      tabs[details.tabId] = 'tas-ix';
      setTasixIcon(details.tabId);
    }

    if (domainResult === false) {
      tabs[details.tabId] = 'no-tas-ix';
      setNotTasixIcon(details.tabId);
    }
  },
  FILTER_ALL_URLS
);

// chrome.webRequest.onHeadersReceived.addListener(
//   function (details) {
//     if (tasixMode) {
//       console.log(details);
//     }
//   },
//   FILTER_ALL_URLS,
//   FILTER_BLOCKING
// );

// Tablar almashganda ikonka mosiga o‘zgartiriladi
chrome.tabs.onActivated.addListener(function (tab) {
  if (tasixMode) {
    return;
  }

  if (!tabs[tab.tabId]) {
    tabs[tab.tabId] = 'checking';
  }
  
  setIcon(tab.tabId, tabs[tab.tabId]);
});

chrome.tabs.onRemoved.addListener(function (tabId, tab) {
  delete tabs[tabId];
});

// Kengaytma tugmasi bosilganda “Faqat Tas-ix” rejimiga o‘tish
// Ikonka ham mos ravishda o‘zgaradi va “ON” yorlig‘i qo‘yiladi
chrome.browserAction.onClicked.addListener(function (tab) {
  return;
  if (tasixMode) {
    setCheckingIcon(tab.tabId);
    chrome.browserAction.setBadgeText({
      text: ''
    });
  } else {
    setTasixModeIcon(tab.tabId);
    chrome.browserAction.setBadgeText({
      text: 'ON'
    });
  }

  tasixMode = !tasixMode;
});

// Oraliqlarni qayta yuklash:
//
// Birinchi marta o‘rnatilganda, yangilanganda
chrome.runtime.onInstalled.addListener(function (details) {
  checkRanges();
});

// Yangi oyna ochilganda
chrome.windows.onCreated.addListener(function (window) {
  checkRanges();
});

// IP oraliqlari yuklanadi
function reloadRanges() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var response = xhr.responseText.trim();
      localStorage['ranges'] = response;
      localStorage['ranges-update-date'] = new Date();

      ranges = response.split("\n");

      domains = {};
    }
  }
  xhr.open('GET', RANGES_SOURCE_URL, true);
  xhr.send();
}

// Lokal saqlangan IP oraliqlari tekshiriladi
function checkRanges() {
  if (!localStorage['ranges']) {
    reloadRanges();
    return;
  }

  var reloadDateValue = localStorage['ranges-update-date'];
  if (!reloadDateValue) {
    reloadRanges();
    return;
  }

  var reloadDate = new Date();
  reloadDate.setTime(Date.parse(reloadDateValue));

  var today = new Date();
  var elapsed = today.getTime() - reloadDate.getTime();
  var days = Math.round((((elapsed / 1000) / 60) / 60) / 24);

  if (days > RANGES_UPDATE_DAYS) {
    reloadRanges();
  }
}

// Bitta oraliqqa tekshirish
function in_range(addr, range) {
  if (range.indexOf('/') !== -1) {
    var range_data = range.split('/');
    
    var parse_addr = ipaddr.parse(addr);
    var parse_range = ipaddr.parse(range_data[0]);

    return parse_addr.match(parse_range, range_data[1]);
  }

  return false;
}

// Hamma oraliqlarga tekshirish
function checkIp(addr) {
  if (!ranges || ranges.length == 0) {
    ranges = localStorage['ranges'].split("\n");
  }

  var addrInRange = false;
  for (var i in ranges) {
    var range = ranges[i];

    if (in_range(addr, range)) {
      addrInRange = true;
      break;
    }
  }

  return addrInRange;
}

// URLdan domenni qirqib olish
function getDomainFromURL(url) {
  url = url.replace(new RegExp(/\\/g), '/');
  url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), '');
  url = url.replace(new RegExp(/\/(.*)/), '');
  return url;
}