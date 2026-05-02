let _carrusel = null;
let _currentSlide = 0;
let _canvas = null;

function buildCards() {
  const container = document.getElementById('slideCards');
  container.innerHTML = '';
  _carrusel.slides.forEach((slide, i) => {
    const card = document.createElement('div');
    card.className = 'slide-card' + (i === _currentSlide ? ' active' : '');
    card.innerHTML =
      '<div class="slide-num">Slide 0' + (i + 1) + '</div>' +
      '<div class="slide-phrases">' +
        '<div class="phrase-row">' +
          '<span class="phrase-icon">🖤</span>' +
          '<span class="phrase-text neg">' + slide[0] + '</span>' +
        '</div>' +
        '<div class="phrase-row">' +
          '<span class="phrase-icon">🎨</span>' +
          '<span class="phrase-text pos">' + slide[1] + '</span>' +
        '</div>' +
      '</div>';
    card.addEventListener('click', function() {
      _currentSlide = i;
      buildCards();
      renderCanvas(_canvas, _carrusel, _currentSlide);
    });
    container.appendChild(card);
  });
}

function init(carruselId) {
  _carrusel = CARRUSELES.find(function(c) { return c.id === carruselId; });
  _canvas   = document.getElementById('previewCanvas');

  document.getElementById('btnCurrent').addEventListener('click', function() {
    downloadSlide(_carrusel, _currentSlide);
  });

  document.getElementById('btnAll').addEventListener('click', function() {
    downloadAll(_carrusel);
  });

  preloadImage(_carrusel).then(function() {
    buildCards();
    renderCanvas(_canvas, _carrusel, _currentSlide);
  });
}
