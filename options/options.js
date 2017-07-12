document.addEventListener('DOMContentLoaded', function () {
    var bg = chrome.extension.getBackgroundPage();
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
