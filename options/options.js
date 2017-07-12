document.addEventListener('DOMContentLoaded', function () {
    var bg = chrome.extension.getBackgroundPage();

    $("#start").click(function () {
        bg.start();
    });

    $("#stop").click(function () {
        bg.stop();
    });
});
