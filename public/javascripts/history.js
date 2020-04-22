$(document).ready(function () {
  /* === Function Defs === */
  function showHistory() {
    // clear detail section
    $('#secret').text('');
    $('#num_guesses').text('');
    $('#guesses').empty();
    $('#game_detail').hide();
    $('#history').hide();
    $('table').show();
  }

  $('tr').on('click', async function () {
    const id = $(this).data('objectid');
    let response;
    try {
      response = await fetch(`detail?gameid=${id}`, {
        method: 'get',
        headers: {
          Accept: 'application/json, text/plain, */*, text/html',
          'Content-type': 'text/html',
        },
      });
    } catch (err) {
      console.error(err.stack);
    }
    if (response.ok) {
      try {
        const game = await response.json();
        $('#secret').text(game.secretNumber);
        $('#num_guesses').text(game.guesses.length);
        $('#date').text(game.timeStamp);
        game.guesses.forEach((guess) => {
          $('<li/>')
            .addClass('list-item')
            .text(guess)
            .append('<a/>')
            .appendTo('#guesses');
        });
        $('table').hide();
        $('#game_detail').show();
        $('#history').show();
      } catch (error) {
        console.error(error.stack);
      }
    }
  });
  $('#history').on('click', showHistory).hide();
});
