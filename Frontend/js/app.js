// PocketFlow — Expenses module (frontend)
// Talks to the Backend API (RF-01, RF-02.1, RF-05.1, RF-05.2, RF-05.4).

const API_BASE = 'http://localhost:4000/api/expenses';

const CATEGORIES = [
  'Food', 'Transport', 'Entertainment', 'Utilities', 'Health',
  'Education', 'Clothing', 'Home', 'Technology', 'Travel', 'Gifts', 'Other'
];

//state
let expenses = [];
let pendingDeleteId = null;

// element refs
const els = {
  filterCategoria: document.getElementById('filter-categoria'),
  tableBody: document.getElementById('expenses-body'),
  table: document.getElementById('expenses-table'),
  emptyState: document.getElementById('empty-state'),
  loadingState: document.getElementById('loading-state'),
  errorState: document.getElementById('error-state'),
  errorMessage: document.getElementById('error-message'),
  btnRetry: document.getElementById('btn-retry'),

  btnNew: document.getElementById('btn-new'),
  btnEmptyNew: document.getElementById('btn-empty-new'),

  modalOverlay: document.getElementById('modal-overlay'),
  modalTitle: document.getElementById('modal-title'),
  modalClose: document.getElementById('modal-close'),
  form: document.getElementById('expense-form'),
  inputId: document.getElementById('expense-id'),
  inputMonto: document.getElementById('input-monto'),
  inputCategoria: document.getElementById('input-categoria'),
  inputFecha: document.getElementById('input-fecha'),
  inputDescripcion: document.getElementById('input-descripcion'),
  btnCancel: document.getElementById('btn-cancel'),

  confirmOverlay: document.getElementById('confirm-overlay'),
  confirmTarget: document.getElementById('confirm-target'),
  btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
  btnConfirmDelete: document.getElementById('btn-confirm-delete'),

  toast: document.getElementById('toast')
};

//init
function populateCategorySelects() {
  const filterFrag = document.createDocumentFragment();
  const formFrag = document.createDocumentFragment();

  CATEGORIES.forEach((cat) => {
    const optFilter = document.createElement('option');
    optFilter.value = cat.toUpperCase();
    optFilter.textContent = cat;
    filterFrag.appendChild(optFilter);

    const optForm = document.createElement('option');
    optForm.value = cat.toUpperCase();
    optForm.textContent = cat;
    formFrag.appendChild(optForm);
  });

  els.filterCategoria.appendChild(filterFrag);
  els.inputCategoria.appendChild(formFrag);
}

function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
}

// ---- rendering ----
function setState(state) {
  els.table.classList.toggle('hidden', state !== 'ready' && state !== 'empty');
  els.emptyState.classList.toggle('hidden', state !== 'empty');
  els.loadingState.classList.toggle('hidden', state !== 'loading');
  els.errorState.classList.toggle('hidden', state !== 'error');
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: '2-digit' });
}

function renderTable() {
  els.tableBody.innerHTML = '';

  if (expenses.length === 0) {
    setState('empty');
    return;
  }

  setState('ready');

  const frag = document.createDocumentFragment();

  expenses.forEach((exp) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${formatDate(exp.fecha)}</td>
      <td><span class="badge-cat">${exp.categoria}</span></td>
      <td class="desc-cell" title="${escapeHtml(exp.descripcion || '')}">${escapeHtml(exp.descripcion) || '—'}</td>
      <td class="col-amount">${formatMoney(exp.monto)}</td>
      <td>
        <div class="row-actions">
          <button class="btn-icon" data-action="edit" data-id="${exp._id}" aria-label="Editar">✎</button>
          <button class="btn-icon danger" data-action="delete" data-id="${exp._id}" aria-label="Eliminar">🗑</button>
        </div>
      </td>
    `;

    frag.appendChild(tr);
  });

  els.tableBody.appendChild(frag);
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'success') {
  els.toast.textContent = message;
  els.toast.className = `toast ${type}`;
  els.toast.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => els.toast.classList.add('hidden'), 3200);
}

//API calls
async function fetchExpenses() {
  setState('loading');
  try {
    const categoria = els.filterCategoria.value;
    const url = categoria ? `${API_BASE}?categoria=${encodeURIComponent(categoria)}` : API_BASE;
    const res = await fetch(url);
    const body = await res.json();

    if (!res.ok || !body.success) {
      throw new Error(body.error || 'No se pudieron cargar los gastos');
    }

    expenses = body.data;
    renderTable();
  } catch (err) {
    els.errorMessage.textContent = err.message.includes('fetch')
      ? 'No se pudo conectar con la API. ¿Está corriendo el backend en localhost:4000?'
      : err.message;
    setState('error');
  }
}

async function saveExpense(payload, id) {
  const url = id ? `${API_BASE}/${id}` : API_BASE;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const body = await res.json();

  if (!res.ok || !body.success) {
    const err = new Error(body.error || 'No se pudo guardar el gasto');
    err.fieldErrors = body.errors || [];
    throw err;
  }

  return body.data;
}

async function removeExpense(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  const body = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.error || 'No se pudo eliminar el gasto');
  }
}

//create/edit
function clearFieldErrors() {
  ['monto', 'categoria', 'fecha', 'descripcion'].forEach((f) => {
    document.getElementById(`err-${f}`).textContent = '';
  });
}

function openModal(mode, expense = null) {
  clearFieldErrors();
  els.form.reset();

  if (mode === 'edit' && expense) {
    els.modalTitle.textContent = 'Editar gasto';
    els.inputId.value = expense._id;
    els.inputMonto.value = expense.monto;
    els.inputCategoria.value = expense.categoria;
    els.inputFecha.value = new Date(expense.fecha).toISOString().slice(0, 10);
    els.inputDescripcion.value = expense.descripcion || '';
  } else {
    els.modalTitle.textContent = 'Nuevo gasto';
    els.inputId.value = '';
    els.inputFecha.value = todayISO();
    els.inputFecha.max = todayISO();
  }

  els.modalOverlay.classList.remove('hidden');
  els.inputMonto.focus();
}

function closeModal() {
  els.modalOverlay.classList.add('hidden');
}

async function handleFormSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const id = els.inputId.value || null;
  const payload = {
    monto: parseFloat(els.inputMonto.value),
    categoria: els.inputCategoria.value,
    fecha: els.inputFecha.value,
    descripcion: els.inputDescripcion.value.trim()
  };

  const btnSave = document.getElementById('btn-save');
  btnSave.disabled = true;
  btnSave.textContent = 'Guardando…';

  try {
    await saveExpense(payload, id);
    closeModal();
    showToast(id ? 'Gasto actualizado' : 'Gasto registrado', 'success');
    fetchExpenses();
  } catch (err) {
    if (err.fieldErrors && err.fieldErrors.length) {
      err.fieldErrors.forEach((fe) => {
        const target = document.getElementById(`err-${fe.field}`);
        if (target) target.textContent = fe.message;
      });
    } else {
      showToast(err.message, 'error');
    }
  } finally {
    btnSave.disabled = false;
    btnSave.textContent = 'Guardar';
  }
}

//delete confirmation
function openConfirm(id) {
  const exp = expenses.find((x) => x._id === id);
  pendingDeleteId = id;
  els.confirmTarget.textContent = exp ? `${exp.categoria} · ${formatMoney(exp.monto)}` : 'este gasto';
  els.confirmOverlay.classList.remove('hidden');
}

function closeConfirm() {
  pendingDeleteId = null;
  els.confirmOverlay.classList.add('hidden');
}

async function handleConfirmDelete() {
  if (!pendingDeleteId) return;
  try {
    await removeExpense(pendingDeleteId);
    showToast('Gasto eliminado', 'success');
    closeConfirm();
    fetchExpenses();
  } catch (err) {
    showToast(err.message, 'error');
    closeConfirm();
  }
}

//event wiring
function init() {
  populateCategorySelects();
  fetchExpenses();

  els.filterCategoria.addEventListener('change', fetchExpenses);
  els.btnRetry.addEventListener('click', fetchExpenses);

  els.btnNew.addEventListener('click', () => openModal('create'));
  els.btnEmptyNew.addEventListener('click', () => openModal('create'));
  els.modalClose.addEventListener('click', closeModal);
  els.btnCancel.addEventListener('click', closeModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
  });

  els.form.addEventListener('submit', handleFormSubmit);

  els.tableBody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const expense = expenses.find((x) => x._id === id);

    if (btn.dataset.action === 'edit') {
      openModal('edit', expense);
    } else if (btn.dataset.action === 'delete') {
      openConfirm(id);
    }
  });

  els.btnConfirmCancel.addEventListener('click', closeConfirm);
  els.btnConfirmDelete.addEventListener('click', handleConfirmDelete);
  els.confirmOverlay.addEventListener('click', (e) => {
    if (e.target === els.confirmOverlay) closeConfirm();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeConfirm();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
