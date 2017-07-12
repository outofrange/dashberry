var selector = "#container-with-scroll";
var duration = 45 * 1000; // seconds

function scrollToBottom(element, duration) {
    var scrollHeight = element[0].scrollHeight - element.height();
    element.css({
        scrollTop: 0
    })
        .animate({
                scrollTop: scrollHeight
            },
            duration);
}

function startScrolling() {
    var c = $(selector);

    if (!document.hidden) {
        scrollToBottom(c, duration);
    } else {
        c.finish();
        c.css({
            scrollTop: 0
        });
    }
}

chrome.runtime.onMessage.addListener(function() {
	startScrolling();
});