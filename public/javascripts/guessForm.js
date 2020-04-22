$(document).ready(function () {
  /*
    === Function Defintions ===
  */
  /**
   * Handle Guess Click
   */
  async function guessInputHandler() {
    const guess = $(this).siblings('input').val();
    $(this).siblings('input').val('');
    console.log(`user guess: ${guess}`);
    if (guess.trim() === '') return;
    try {
      const response = await fetch('/guess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guess,
        }),
      });
      const result = await response.json();
      const li = $('<li/>');
      if (result.result === 'success') {
        console.log('guess was sucess');
        window.location.replace(
          `${window.location.protocol}//${window.location.host}/success`
        );
      } else if (result.result === 'too high') {
        li.addClass('highGuess')
          .text(`${guess} is too high`)
          .appendTo('#guess-display');
      } else if (result.result === 'too low') {
        li.addClass('lowGuess')
          .text(`${guess} is too low`)
          .appendTo('#guess-display');
      }
      const ul = $('#guess-display');
      ul[0].scrollTop = ul[0].scrollHeight;
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * Show Instructions
   */
  function toggleInstructions() {
    $('.instructions').toggle();
    $('#showInstructions').toggle();
  }
  /*
    === Main Logic ===
  */
  $('form').on('keypress', function (e) {
    if (e.which === 13) {
      e.preventDefault();
      $('#guess_input').click();
      return false;
    }
    return true;
  });
  $('#guess_input').on('click', guessInputHandler);
  $('#showInstructions').on('click', toggleInstructions);
  $('.instructions').on('click', toggleInstructions);
});
