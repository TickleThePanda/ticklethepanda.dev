import { BasicHistory, HealthClient } from "./lib/health-client.js";
import { ChartClient } from "./lib/chart-client.js";
import { ChartSizeManager } from "./lib/chart-size-manager.js";
import { TokenStorage } from "./lib/token-storage.js";
import type { View } from "vega-typings/types";

const tokenStorage = new TokenStorage();
const token = tokenStorage.load();


type WeightChartOptions = {
  minDate: Date,
  source: BasicHistory[],
  minY: number,
  maxY: number
}
export class WeightChartManager {
  private chart: View | undefined;

  private healthClient: HealthClient;
  private chartClient: ChartClient;

  private chartOptions: Record<string, WeightChartOptions>| undefined;
  private currentChart: string;
  private chartSpec: unknown | undefined;
  private chartContainer: string;

  constructor(healthClient: HealthClient, chartClient: ChartClient, currentChart: string, chartContainer: string) {
    this.healthClient = healthClient;
    this.chartClient = chartClient;
    this.currentChart = currentChart;
    this.chartContainer = chartContainer;
  }

  async load() {
    await this.loadChartSpec();
    await this.loadData();

    console.log(this.chartSpec);

    const font = this.getChartFont()

    this.chart = new vega.View(
      vega.parse(this.chartSpec, {
        axis: {
          labelFont: font,
          labelFontSize: 18,
          titleFont: font,
          titleFontSize: 22,
        },
      })
    ).renderer("svg");

    this.switchToChart(this.currentChart, true);

    if (this.chart !== undefined) {
      new ChartSizeManager().add(this.chart);
    }

  }

  switchToChart(chart: string, initialize: boolean = false) {
    if (this.chartOptions !== undefined) {
      const options = this.chartOptions[chart];
      this.chart
        ?.signal("minDate", options.minDate)
        .data("source", options.source)
        .signal("minY", options.minY)
        .signal("maxY", options.maxY);
      if (initialize) {
        this.chart?.initialize(this.chartContainer);
      }
      this.chart?.run()
    }
  }

  async reloadData() {
    await this.loadData()
    this.switchToChart(this.currentChart);
  }

  private async loadChartSpec() {
    this.chartSpec = await this.chartClient.fetchWeightChartSpec();
  }

  private async loadData() {

    const [weightWeek, weightMonth, weightQuarterlyMa, weightYearly] = await Promise.all([
      this.healthClient.fetchWeightHistoryWithPeriod(4, 4),
      this.healthClient.fetchWeightHistoryWithPeriod(7, 4),
      this.healthClient.fetchWeightHistoryWithPeriod(7 * 2 /* 14 days */, 2 * 3 /* 3 months */),
      this.healthClient.fetchWeightHistoryWithPeriod(365, 1)
    ]);
  
    const dataMinDate = new Date(weightWeek[0].date.getTime());
    dataMinDate.setDate(dataMinDate.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);
  
  
    const options: Record<string, WeightChartOptions> = {
      yearly: {
        minDate: dataMinDate,
        source: weightYearly,
        minY: 75,
        maxY: 125
      },
      all: {
        minDate: dataMinDate,
        source: weightQuarterlyMa,
        minY: 75,
        maxY: 125
      },
      "trying-again": {
        minDate: new Date(2022, 5, 1),
        source: weightMonth,
        minY: 75,
        maxY: 125
      },
      recent: {
        minDate: sixMonthsAgo,
        source: weightWeek,
        minY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.min(prev, curr.weight), Number.MAX_VALUE) - 2,
        maxY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.max(prev, curr.weight), Number.MIN_VALUE) + 2
      },
    };
    this.chartOptions = options;
  }

  getChartFont() {
    const chartElement = document.querySelector(this.chartContainer);
    if (chartElement === null) {
      return undefined;
    } else {
      const fontFamily = window.getComputedStyle(chartElement, null).getPropertyValue("font-family");
      const firstFont = fontFamily.split(",")[0];
      return firstFont;
    }
  }
}
