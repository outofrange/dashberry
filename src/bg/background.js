const chromep = new ChromePromise();

var config = {
    displayMs: 5000,
    tabBuffer: 3,

    pages: [
        // urls
    ]
};

function Revolution(config) {
    var that = this;

    this.config = config;
    this.tabs = [];
    this.tab = 0;
    this.nextPage = 0;
    this.running = false;

    this.start = function () {
        that.running = true;

        // init Buffer
        console.log('Creating ' + that.config.tabBuffer + ' buffer tabs');
        Promise.all(_.times(that.config.tabBuffer, function () {
            return chromep.tabs.create({
                active: false
            });
        })).then(function (tabs) {
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
        }).then(function () {
            console.log('Showing initial tab');
            return chromep.tabs.update(that.tabs[that.tab++].id, {
                active: true
            });
        }).then(function () {
            console.log('Starting schedule');
            window.setTimeout(that.showNext, that.config.displayMs);
        });
    };

    this.stop = function () {
        that.running = false;
        chrome.tabs.remove(_.map(that.tabs, function (tab) { return tab.id }));
    };

    this.showNext = function () {
        if (that.running) {
            console.log('Scheduled call of showNext');

            var tabToShow = that.tabs[that.tab % that.tabs.length];
            console.log('Showing next tab ' + that.tab);

            chromep.tabs.update(tabToShow.id, {
                active: true
            }).then(function () {
                // start scrolling
                chrome.tabs.sendMessage(tabToShow.id, {});

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
                window.setTimeout(that.showNext, that.config.displayMs);
            });
        } else {
            console.log('showNext called but not running');
        }
    };
}


var r;
r = new Revolution(config);
r.start();
function start() {
    r = new Revolution(config);
    r.start();
}

function stop() {
    if (r) {
        r.stop();
    }
}