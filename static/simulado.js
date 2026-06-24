function mostrarTab(tab) {
  document.getElementById('tab-questoes').style.display = tab === 'questoes' ? 'block' : 'none';
  document.getElementById('tab-nova').style.display     = tab === 'nova'     ? 'block' : 'none';

  document.getElementById('tab-btn-questoes').classList.toggle('active', tab === 'questoes');
  document.getElementById('tab-btn-nova').classList.toggle('active',     tab === 'nova');
}
