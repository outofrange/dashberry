const chromep = new ChromePromise();

function Revolution(config) {
    var that = this;

    this.config = config;
    this.tabs = [];
    this.tab = 0;
    this.nextPage = 0;
    this.running = false;

    var createBufferTabs = function () {
        return chromep.tabs.create({
            active: false
        });
    };

    var preloadPages = function (tabs) {
        that.tabs = tabs;
        console.log('Preloading pages');

        return Promise.all(_.map(that.tabs, function (tab) {
            var page = that.config.pages[that.nextPage++ % that.config.pages.length];
            console.log('Loading page: ' + page);

            return chromep.tabs.update(tab.id, {
                url: page,
                active: false
            });
        }));
    };

    var showInitialTab = function () {
        console.log('Showing initial tab');
        return chromep.tabs.update(that.tabs[that.tab++].id, {
            active: true
        });
    };

    var startScrollingAndSetFirstSchedule = function (tab) {
        chrome.tabs.sendMessage(tab.id, {selector: "#container-with-scroll", duration: that.config.displayMs});
        console.log('Starting schedule');
        window.setTimeout(showNext, that.config.displayMs);
    };

    this.start = function () {
        that.running = true;

        console.log('Creating ' + that.config.tabBuffer + ' buffer tabs');
        Promise
            .all(_.times(that.config.tabBuffer, createBufferTabs))
            .then(preloadPages)
            .then(showInitialTab)
            .then(startScrollingAndSetFirstSchedule);
    };

    this.stop = function () {
        that.running = false;
        chrome.tabs.remove(_.map(that.tabs, function (tab) {
            return tab.id
        }));
    };

    var showNext = function () {
        if (that.running) {
            console.log('Scheduled call of showNext');

            var tabToShow = that.tabs[that.tab % that.tabs.length];
            console.log('Showing next tab ' + that.tab);

            chromep.tabs.update(tabToShow.id, {
                active: true
            }).then(function () {
                // start scrolling
                chrome.tabs.sendMessage(tabToShow.id, {
                    selector: "#container-with-scroll",
                    duration: that.config.displayMs
                });

                var bufferTabIndex = (that.tab++ - 1) % that.tabs.length;
                var bufferTab = that.tabs[bufferTabIndex];
                var page = that.config.pages[that.nextPage++ % that.config.pages.length];
                console.log('Buffering next page: ' + page + ' into tab ' + bufferTabIndex);

                return chromep.tabs.update(bufferTab.id, {
                    url: page,
                    active: false
                })
            }).then(function (tab) {
                console.log('Scheduling next tab in ' + that.config.displayMs + 'ms');
                window.setTimeout(showNext, that.config.displayMs);
            });
        } else {
            console.log('showNext called but not running');
        }
    };
}

var r;

var loadConfig = function (callback) {
    chrome.storage.sync.get('config', callback);
};

function start(config) {
    if (!r || !r.running) {
        r = new Revolution(config);
        r.start();

        chrome.browserAction.setTitle({title: 'Dashberry - Running'});
        chrome.browserAction.setBadgeText({text: 'RUN'});
    }
}

function stop() {
    if (r) {
        r.stop();
        r = null;

        chrome.browserAction.setTitle({title: 'Dashberry - Stopped'});
        chrome.browserAction.setBadgeText({text: ''});
    }
}

function toggleMode() {
    if (r) {
        stop();
    } else {
        start();
    }
}

chrome.browserAction.onClicked.addListener(toggleMode);

chrome.storage.sync.get(['autostart', 'config'], function (s) {
    console.log(s);

    if (s.autostart) {
        start();
    }
    config = JSON.parse(s.config);
});