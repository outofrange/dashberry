(function () {
    const chromep = new ChromePromise();

    var defaultConfig = {
        displayMs: 3000,
        tabBuffer: 3,
        autoStart: false,
        pages: []
    };
    var Page = function (url) {
        this.url = url;
        this.displayMs = $scope.config.displayMs;
        this.scroll = {
            enabled: false,
            selector: null,
            duration: $scope.config.displayMs
        };
    };

    angular.module('dashberry', ['ngMaterial'])
        .controller('OptionsController', function ($scope) {
            $scope.config = null;
            (function () {
                return chromep.storage.sync.get('config')
                    .then(function (c) {
                        console.log('Loaded config from storage');
                        return c.config;
                    }).catch(function () {
                        console.log('Loading default config, nothing found in storage');
                        return defaultConfig;
                    }).then(function (c) {
                        console.log(c);
                        $scope.config = c;
                    });
            })();

            $scope.save = function () {
                chrome.storage.sync.set({config: $scope.config});
            };

            $scope.clear = function () {
                $scope.config = defaultConfig;
            };
        });
})();
/*
document.addEventListener('DOMContentLoaded', function () {
    //var bg = chrome.extension.getBackgroundPage();
    var autostart = $('#autostart');
    var config = $('#config');

    chrome.storage.sync.get(['autostart', 'config'], function (s) {
        autostart.prop('checked', s.autostart);
        config.val(s.config);
    });

    autostart.change(function () {
        var val = autostart.prop('checked');
        chrome.storage.sync.set({autostart: val});
        bg.console.log('Autostart saved to ' + val)
    });

    config.change(function () {
        var val = config.val();
        chrome.storage.sync.set({config: val});
        bg.console.log('Config saved');
        bg.console.log(val);
    });
});
*/