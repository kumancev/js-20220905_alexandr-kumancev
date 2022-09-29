import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};

  constructor(
    headerCfg = {},
    {
      url = "",
      isSortLocally = false,
      sorted = { id: headerCfg.find((item) => item.sortable).id, order: "asc" },
    } = {}
  ) {
    this.header = headerCfg;
    this.data = [];
    this.url = new URL(url, BACKEND_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.start = 1;
    this.step = 20;
    this.end = this.start + this.step;
    this.loading = false;

    this.render();
  }

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = (order) => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder,
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (
      bottom < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally
    ) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  getTemplate() {
    return `
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
      </div>`;
  }

  getTableHeader(header) {
    return header
      .map(({ id = "", title = "", sortable = false }) => {
        const order = this.sorted.id === id ? this.sorted.order : "asc";
        const isOrder = this.sorted.id === id ? this.sorted.order : "";
        return `
        <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
          <span>${title}</span>
          ${
            isOrder
              ? '<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>'
              : ""
          }
        </div>
      `;
      })
      .join("");
  }

  getTableRows(tableRows) {
    return tableRows
      .map(
        (item) => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableCells(item)}
      </a>`
      )
      .join("");
  }

  getTableCells(tableCell) {
    return this.header
      .map(({ id, template }) => {
        return { id, template };
      })
      .map(({ id, template }) => {
        if (template) {
          return template(tableCell[id]);
        } else {
          return `<div class="sortable-table__cell">${tableCell[id]}</div>`;
        }
      })
      .join("");
  }

  async render() {
    const { id, order } = this.sorted;
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);

    const data = await this.loadData(id, order, this.start, this.end);
    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    this.element.classList.add("sortable-table_loading");

    const data = await fetchJson(this.url);

    this.element.classList.remove("sortable-table_loading");

    return data;
  }

  update(data) {
    const rows = document.createElement("div");

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onSortClick);
    document.addEventListener("scroll", this.onWindowScroll);
  }

  sortOnClient(id, order) {
    const column = this.header.find((item) => item.id === id);
    const { sortType } = column;

    const sortDir = order === "asc" ? 1 : -1;
    const actualSortType =
      sortType === "string"
        ? (a, b) => a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" })
        : (a, b) => a - b;
    const dataSorting = [...this.data].sort(
      (a, b) => actualSortType(a[id], b[id]) * sortDir
    );

    this.subElements.body.innerHTML = this.getTableRows(dataSorting);
  }

  async sortOnServer(id, order) {
    const data = await this.loadData(id, order, this.start, this.end);

    if (data.length) {
      this.element.classList.remove("sortable-table_empty");
    } else {
      this.element.classList.add("sortable-table_empty");
    }

    this.subElements.body.innerHTML = this.getTableRows(data);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    document.removeEventListener("scroll", this.onWindowScroll);
  }
}
