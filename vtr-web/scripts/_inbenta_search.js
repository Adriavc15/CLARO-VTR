if (window.location.hash && window.location.hash.includes("tabs-")) {
  history.replaceState(null, null, window.location.pathname + window.location.search);
}

document.addEventListener("DOMContentLoaded", function () {

  setTimeout(function () {
    // var tabs = document.querySelectorAll('.holder-faq ul .tab-link.nav-link');
    var tabs = document.querySelectorAll('.holder-faq ul .tab-link');

    tabs.forEach(function (tab) {
      tab.setAttribute('data-toggle', 'tab');
    });
  }, 3000);

});