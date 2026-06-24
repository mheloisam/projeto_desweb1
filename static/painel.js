document.getElementById('btn-novo-simulado').addEventListener('click', function () {
  document.getElementById('modal-novo-simulado').style.display = 'flex';
});

document.getElementById('btn-cancelar-sim').addEventListener('click', function () {
  document.getElementById('modal-novo-simulado').style.display = 'none';
});

document.getElementById('modal-novo-simulado').addEventListener('click', function (e) {
  if (e.target === this) this.style.display = 'none';
});
