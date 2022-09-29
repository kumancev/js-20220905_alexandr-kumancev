export default class SortableTable {
    element;
    subElements = {};
  
    constructor(headersConfig, {data = [], isSortLocally = true} = {}, sorted = {id: headersConfig.find(item => item.sortable).id, order: 'asc'}) {
      this.header = headersConfig;
      this.data = Array.isArray(data) ? data : data.data;
      this.sortField = sorted.id;
      this.sortOrder = sorted.order;
  
      this.render();
      this.initListeners();
      this.sort(this.sortField, this.sortOrder);
    }
  
    initListeners() {
      this.subElements.header.addEventListener('pointerdown', this.onMouseClick);
    }
  
    onMouseClick = event => {
      const headerItem = event.target.closest('[data-sortable="true"]');
      if (headerItem) {
        this.sortField = headerItem.dataset.id;
        this.sortOrder = (headerItem.dataset.order === 'desc') ? 'asc' : 'desc';
        this.sort(this.sortField, this.sortOrder);
      }
    }
  
    getTemplate() {
      return `
        <div data-element="productsContainer" class="products-list__container">
          <div class="sortable-table">
            <div data-element="header" class="sortable-table__header sortable-table__row">
              ${this.getTableHeader(this.header)}
            </div>
            <div data-element="body" class="sortable-table__body">
              ${this.getTableRows(this.data)}
            </div>
            <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
            <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
              <div>
                <p>No products satisfies your filter criteria</p>
                <button type="button" class="button-primary-outline">Reset all filters</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  
    getTableHeader(header) {
      return header.map(({id = '', title = '', sortable = false}) => {
        return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${this.sortField === id ? 'data-order="' + this.sortOrder + '"' : ''}>
            <span>${title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>
          </div>
          `;
      }).join('');
    }
  
    getTableRows(tableRows) {
      return tableRows.map(item => {
        return `<a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableCells(item)}
        </a>`;
      }).join('');
    }
  
    getTableCells(tableCell) {
      return this.header.map(({id, template}) => {return {id, template};}).map(({id, template}) => {
        if (template) {
          return template(tableCell[id]);
        }
        return `<div class="sortable-table__cell">${tableCell[id]}</div>`;
      }).join('');
    }
  
    render() {
      const element = document.createElement('div');
      element.innerHTML = this.getTemplate();
      this.element = element.firstElementChild;
  
      this.subElements = this.getSubElements(this.element);
    }
  
    sort (fieldValue, orderValue) {
      this.sortOrder = orderValue;
      this.sortField = fieldValue;
      const conf = this.header.find(item => item.id === this.sortField);
      if (!conf) {
        return;
      }
      this.sortType = conf.sortType;
  
      const sortDir = (this.sortOrder === 'asc') ? 1 : (-1);
      const sortType = this.sortType === 'string' ? (a, b) => a.localeCompare(b, ['ru', 'en'], {caseFirst: 'upper'}) : (a, b) => a - b;
      const dataSorting = [...this.data].sort((a, b) => sortType(a[this.sortField], b[this.sortField]) * sortDir);
  
      this.subElements.header.innerHTML = this.getTableHeader(this.header);
      this.subElements.body.innerHTML = this.getTableRows(dataSorting);
    }
  
    getSubElements(element) {
      const elements = element.querySelectorAll('[data-element]');
      return [...elements].reduce((accum, subElement) => {
        accum[subElement.dataset.element] = subElement;
        return accum;
      }, {});
    }
  
    remove() {
      this.element.remove();
    }
  
    destroy() {
      this.element.remove();
      this.subElements = {};
    }
}
