$(document).ready(function () {
  // Function Definitions
  function toggleSection() {
    $('#section-nav ul li').toggleClass('section-selected');
    $('section').toggleClass('hidden');
  }
  $('#section-nav ul li').on('click', toggleSection);
});
