CIDR_SOURCE_URL = 'http://tasix.sarkor.uz/full';
FILTER_ALL_URLS = { urls: ['<all_urls>'] };

// URLdan domenni qirqib olish
function getDomainFromURL(url) {
  url = url.replace(new RegExp(/\\/g), '/');
  url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i), '');
  url = url.replace(new RegExp(/\/(.*)/), '');
  return url;
}

// Tabda ochilgan sayt tasiksda
// Tasiks ikonkasi yashilga o‘zgartiriladi
// va mos matn qo‘yiladi
function setActive(tabId) {
  chrome.pageAction.setIcon({
    tabId: tabId,
    path: 'icons/16.png'
  });
  chrome.pageAction.setTitle({
    tabId: tabId,
    title: chrome.i18n.getMessage('tasix')
  });
}

// Tabda ochilgan sayt tasiksda emas
function setInactive(tabId) {
  chrome.pageAction.setIcon({
    tabId: tabId,
    path: 'icons/other.png'
  });
  chrome.pageAction.setTitle({
    tabId: tabId,
    title: chrome.i18n.getMessage('other')
  });
}

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    if (!details.tabId || details.tabId == -1) {
      return;
    }

    var isMainFrame = (details.type == 'main_frame');
    if (!isMainFrame) {
      return;
    }
  },
  FILTER_ALL_URLS
);

chrome.webRequest.onResponseStarted.addListener(
  function (details) {
    if (!details.tabId || details.tabId == -1) {
      return;
    }

    var isMainFrame = (details.type == 'main_frame');
    if (!isMainFrame) {
      return;
    }

    var domain = getDomainFromURL(details.url);

  },
  FILTER_ALL_URLS
);

function reloadRanges() {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      var response = xhr.responseText;
      localStorage['cidr'] = response;
    }
  }
  xhr.open('GET', CIDR_SOURCE_URL, true);
  xhr.send();
}

/*
// lokal 200 tadan domen saqlanadi
var MAX_LOCAL_SITES_COUNT = 200;

// URLdan domenni qirqib olish
function dnd_noProt(url) {
	url = url.replace(new RegExp(/\\/g),"/");
	url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i),"");
	url = url.replace(new RegExp(/\/(.*)/),"");
	return url;
}

// Tabda ochilgan sayt tasiksda
// Tasiks ikonkasi yashilga o‘zgartiriladi
// va mos matn qo‘yiladi
function setActive(tabId) {
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: "icons/16.png"
	});
	chrome.pageAction.setTitle({
		tabId: tabId,
		title: chrome.i18n.getMessage("tasix")
	});
}

// Tabda ochilgan sayt tasiksda emas
function setInActive(tabId) {
	chrome.pageAction.setIcon({
		tabId: tabId,
		path: "icons/other.png"
	});
	chrome.pageAction.setTitle({
		tabId: tabId,
		title: chrome.i18n.getMessage("other")
	});
}

// Tabni tekshirish tasiksda joylashganiga
function checkForTasix(tabId, changeInfo, tab) {
	
	// Xrom ushbu hodisani ikki marta chaqiradi:
	// birinchi marta sahifa yuklanayotganda — changeInfo.status="loading"
	// ikkinchi marta yuklanib bo‘lgandan so‘ng — changeInfo.status="complete"
	// bizga bir marta tekshirilishi yetarli
	if (changeInfo.status == "complete") return ;
	
	// agar lokal URL bo‘lmasa
	if (tab.url.match("chrome://") || tab.url.match("chrome-extension://") || tab.url.match("file://") || tab.url.match("about:")) {
		return false;
	}
	chrome.pageAction.show(tabId);
	
	// Domenni olamiz
	var domain = dnd_noProt(tab.url);
	
	// Avval localStorage’dan izlaymiz
	var tasixSites = localStorage["tasix"]?localStorage["tasix"].split("|"):[];
	
	var noTasixSites = localStorage["notasix"]?localStorage["notasix"].split("|"):[];
	
	if (tasixSites.indexOf(domain) > -1) {
		setActive(tabId);
		
	} else if (noTasixSites.indexOf(domain) > -1) {
		setInActive(tabId);
		
	} else {
		// XHR so‘rov
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				
				if (xhr.responseText == "true") {
					setActive(tabId);
					tasixSites.push(domain);
				} else {
					setInActive(tabId);
					noTasixSites.push(domain);
				}
				
				if (tasixSites.length > MAX_LOCAL_SITES_COUNT) {
					tasixSites.splice(0, 1);
				}
				
				if (noTasixSites.length > MAX_LOCAL_SITES_COUNT) {
					noTasixSites.splice(0, 1);
				}
				
				localStorage["tasix"] = tasixSites.join("|");
				localStorage["notasix"] = noTasixSites.join("|");
			}
		}
		xhr.open("GET", host + "tasix/check.php?domain=" + domain, true);
		xhr.send();
	}
};

// Tab yangilanganda tekshiriladi
chrome.tabs.onUpdated.addListener(checkForTasix);*/