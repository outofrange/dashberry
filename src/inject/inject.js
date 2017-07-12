function scrollFromTopToBottom(selector, duration) {
    var c = $(selector);

    if (!document.hidden) {
        var scrollHeight = c[0].scrollHeight - c.height();
        c.css({
            scrollTop: 0
        })
            .animate({
                    scrollTop: scrollHeight
                },
                duration);
    } else {
        c.finish();
        c.css({
            scrollTop: 0
        });
    }
}

chrome.runtime.onMessage.addListener(function (args) {
    scrollFromTopToBottom(args.selector, args.duration);
});