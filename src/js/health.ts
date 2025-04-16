import { BasicHistory, HealthClient } from "./lib/health-client";
import { ChartClient } from "./lib/chart-client";
import { ChartSizeManager } from "./lib/chart-size-manager";
import { View, parse, Spec } from "vega";
import { Handler } from "vega-tooltip";

const TRYING_AGAIN_DATE = new Date(2022, 5, 1);

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

  private chartOptions: Record<string, WeightChartOptions> | undefined;
  private currentChart: string;
  private chartContainer: string;
  private results: { weightWeek: BasicHistory[]; weightMonth: BasicHistory[]; weightQuarterlyMa: BasicHistory[]; } | undefined;

  constructor(healthClient: HealthClient, chartClient: ChartClient, currentChart: string, chartContainer: string) {
    this.healthClient = healthClient;
    this.chartClient = chartClient;
    this.currentChart = currentChart;
    this.chartContainer = chartContainer;
  }

  async load() {
    const chartSpec = await this.chartClient.fetchWeightChartSpec();
    const chartHandler = new Handler();
    await this.loadData();

    console.log(chartSpec);

    if (chartSpec === undefined) {
      throw new Error("Can't generate chart because spec is undefined");
    }

    const font = this.getChartFont();
    const fontSize = this.getChartFontSize() ?? 12;

    this.chart = new View(
      parse(chartSpec, {
        axis: {
          labelFont: font,
          labelFontSize: fontSize / 1.4,
          titleFont: font,
          titleFontSize: fontSize / 1.3,
        }
      })
    )
      .signal("paddingScale", fontSize / 2.4)
      .tooltip(chartHandler.call)
      .initialize(this.chartContainer)
      .run()

    this.switchToChart(this.currentChart);

    if (this.chart !== undefined) {
      new ChartSizeManager().add(this.chart);
    }

    this.addStats()
  }

  switchToChart(chart: string) {
    this.currentChart = chart;

    if (this.chartOptions !== undefined) {
      const options = this.chartOptions[chart];
      this.chart
        ?.data("source", options.source)
        .signal("minDate", options.minDate)
        .signal("minY", options.minY)
        .signal("maxY", options.maxY)
        .run();
    }
  }

  addStats() {

    const calculateAvgWeeklyLoss = (
      startDate: Date,
    ) => {
      const weightsInPeriod = this.results?.weightWeek.filter((d) => d.date > startDate);
      weightsInPeriod?.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      const firstWeightEntry = weightsInPeriod?.[0];
      const lastWeightEntry = weightsInPeriod?.[weightsInPeriod.length - 1];
      if (firstWeightEntry === undefined || lastWeightEntry === undefined) {
        return "N/A";
      }
      const firstWeight = firstWeightEntry.weight;
      const lastWeight = lastWeightEntry.weight;
      const weightDifference = lastWeight - firstWeight;

      const daysInPeriod = Math.floor((lastWeightEntry.date.getTime() - firstWeightEntry.date.getTime()) / (1000 * 60 * 60 * 24));
      const weeksInPeriod = daysInPeriod / 7;
      const avgWeeklyLoss = weightDifference / weeksInPeriod;

      return {
        avgLoss: -avgWeeklyLoss.toFixed(2),
        startWeight: firstWeight,
        endWeight: lastWeight
      }
    };

    const oneDay = 1000 * 60 * 60 * 24;

    const avgWeeklyLossSinceTryingAgain = calculateAvgWeeklyLoss(TRYING_AGAIN_DATE);
    const avgWeeklyLostOverTheLast2Years = calculateAvgWeeklyLoss(new Date(Date.now() - oneDay * 365 * 2));
    const avgWeeklyLostOverTheLastYear = calculateAvgWeeklyLoss(new Date(Date.now() - oneDay * 365));
    const avgWeeklyLostOverTheLastSixMonths = calculateAvgWeeklyLoss(new Date(Date.now() - oneDay * 180));
    const avgWeeklyLostOverTheLastThreeMonths = calculateAvgWeeklyLoss(new Date(Date.now() - oneDay * 90));
    const avgWeeklyLostOverTheLastMonth = calculateAvgWeeklyLoss(new Date(Date.now() - oneDay * 30));

    const resultsElement = <HTMLElement>document.getElementById("weight-loss-summary");

    const toElement = (title: string, info: "N/A" | { avgLoss: number, startWeight: number, endWeight: number}) => {
      if (info == "N/A") {
        return `
          <div class="weight-loss-average">
            <h4>${title}</h4>
            <p>N/A <span class="unit">kg / week</span>
          </div>
        `
      } else {
        const {
          avgLoss,
          startWeight,
          endWeight
        } = info;
        const total = startWeight - endWeight;
        return `
          <div class="weight-loss-average">
            <h4>${title}</h4>
            <p class="total">${total.toFixed(1)}kg
            <p><span class="unit">${avgLoss} kg / week</span><span class="initial-weight">(From ${startWeight.toFixed(0)} kg)</span>
          </div>
        `
      }
    }

    resultsElement.innerHTML =
      toElement("Since " + TRYING_AGAIN_DATE.toLocaleDateString("en-GB", { year: "numeric", month: "long" }), avgWeeklyLossSinceTryingAgain) +
      toElement("1 year", avgWeeklyLostOverTheLastYear) +
      toElement("3 months", avgWeeklyLostOverTheLastThreeMonths) +
      toElement("1 month", avgWeeklyLostOverTheLastMonth);

  }

  async reloadData() {
    await this.loadData()
    this.switchToChart(this.currentChart);
    this.addStats();
  }

  private async loadData() {

    const [weightWeek, weightMonth, weightQuarterlyMa] = await Promise.all([
      this.healthClient.fetchWeightHistoryWithPeriod(1, 14),
      this.healthClient.fetchWeightHistoryWithPeriod(1, 30),
      this.healthClient.fetchWeightHistoryWithPeriod(1, 30*6)
    ]);

    const dataMinDate = new Date(weightWeek[0].date.getTime());
    dataMinDate.setDate(dataMinDate.getDate() - 30);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 30 * 6);

    this.results = {
      weightWeek: weightWeek,
      weightMonth: weightMonth,
      weightQuarterlyMa: weightQuarterlyMa
    }


    const options: Record<string, WeightChartOptions> = {
      all: {
        minDate: dataMinDate,
        source: weightQuarterlyMa,
        minY: 75,
        maxY: 125
      },
      "trying-again": {
        minDate: TRYING_AGAIN_DATE,
        source: weightMonth,
        minY: 75,
        maxY: 125
      },
      recent: {
        minDate: sixMonthsAgo,
        source: weightWeek,
        minY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.min(prev, curr.weight), Number.MAX_VALUE) - 1,
        maxY: weightWeek.filter((d) => d.date > sixMonthsAgo).reduce((prev, curr) => Math.max(prev, curr.weight), Number.MIN_VALUE) + 1
      },
    };
    this.chartOptions = options;
  }

  private getChartFont() {
    const chartElement = document.querySelector(this.chartContainer);
    if (chartElement === null) {
      return undefined;
    } else {
      const fontFamily = window.getComputedStyle(chartElement, null).getPropertyValue("font-family");
      const firstFont = fontFamily.split(",")[0];
      return firstFont;
    }
  }

  private getChartFontSize() {
    const chartElement = document.querySelector(this.chartContainer);
    if (chartElement === null) {
      return undefined;
    } else {
      const fontSizeText = window.getComputedStyle(chartElement, null).getPropertyValue("font-size");
      const fontSizePx = Math.round(Number.parseFloat(fontSizeText.replace("px", "")));
      return fontSizePx;
    }
  }
}
