import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  apiPath = `${BACKEND_URL}api/dashboard`;
  components = [];

  onDateSelection = async (event) => {
    const { from, to } = event.detail;
    const { id, order } = this.table.sorted;

    const promises = [
      ...this.charts.map((chart) => chart.update(from, to)),
      this.table.loadData(id, order, from, to),
    ];
    await Promise.all(promises);
  };

  initEventListeners() {
    this.element.addEventListener("date-select", this.onDateSelection);
  }

  addComponents() {
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const to = new Date();

    this.addRangePickerElement(from, to);
    this.addChartElements(from, to);
    this.addTableElement();
  }

  addRangePickerElement(from, to) {
    const topPanel = this.element.querySelector(".content__top-panel");
    const rangeP = new RangePicker({ from, to });
    rangeP.render();
    topPanel.append(rangeP.element);

    this.components.push(rangeP);
  }

  addChartElements = (from, to) => {
    const ordersChart = new ColumnChart({
      label: "Orders",
      link: "orders",
      url: `${this.apiPath}/orders`,
      range: {
        from,
        to,
      },
    });

    const salesChart = new ColumnChart({
      label: "Sales",
      link: "sales",
      formatHeading: (p) => `$${p}`,
      url: `${this.apiPath}/sales`,
      range: {
        from,
        to,
      },
    });

    const customersChart = new ColumnChart({
      label: "Customers",
      link: "customers",
      url: `${this.apiPath}/customers`,
      range: {
        from,
        to,
      },
    });
    this.charts = [ordersChart, salesChart, customersChart];

    this.subElements.ordersChart.append(ordersChart.element);
    this.subElements.salesChart.append(salesChart.element);
    this.subElements.customersChart.append(customersChart.element);

    this.components.push(ordersChart, salesChart, customersChart);
  };

  addTableElement() {
    const table = new SortableTable(header, {
      url: `${this.apiPath}/bestsellers`,
      isSortLocally: true,
    });
    this.table = table;
    this.subElements.sortableTable.append(table.element);

    this.components.push(table);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  get template() {
    return `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Dashboard</h2>
          <!-- RangePicker component -->
          <div data-element="rangePicker"></div>
        </div>
        <div data-element="chartsRoot" class="dashboard__charts">
          <!-- column-chart components -->
          <div data-element="ordersChart" class="dashboard__chart_orders"></div>
          <div data-element="salesChart" class="dashboard__chart_sales"></div>
          <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
          <!-- sortable-table component -->
        </div>
      </div>
    `;
  }

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initEventListeners();
    this.addComponents();

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;

    for (const component of this.components) {
      component.destroy();
    }
  }
}
