export { HealthClient, BasicHistory };

const baseUrl = document.documentElement.dataset.urlApiHealth;

async function handleResponse(response: Response): Promise<HealthResult[]> {
  if (response.ok) {
    return response.json();
  } else {
    throw Error("unable to load data: " + response.statusText);
  }
}

function convertToBasicHistory(results: HealthResult[]): BasicHistory[] {
  return results.map(r => ({
    date: new Date(r.start),
    weight: r.averagePresumed
  })).filter(({weight}) => weight !== null);
}

class HealthClient {
  token: string;
  init: RequestInit;
  constructor(token: string) {
    this.token = token;
    const authHeaderValue = "Bearer " + this.token;
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: authHeaderValue,
    });
    this.init = {
      credentials: "include",
      headers,
      mode: "cors",
    };
  }

  async updateDay(req: UpdateEntryRequest): Promise<UpdateEntryResult> {
    const date = req.date;
    const period = req.period;
    const weight = req.weight;

    const url = `${baseUrl}/weight/log/${date}/${period}`;
    const payload = { weight: weight };

    const init: RequestInit = Object.assign(
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      this.init
    );

    const response = await fetch(url, init);
    if (response.ok) {
      return await response.json();
    } else {
      throw Error("unable submit data: " + response.statusText);
    }
  }

  async fetchHistory(): Promise<DayEntry[]> {
    const response = await fetch(baseUrl + "/weight/log", this.init);

    const results = <DayEntry[]>await response.json();

    results.sort((b, a) => a.date.localeCompare(b.date));
    return results.filter((e) => e.weightAm || e.weightPm);
  }

  async fetchWeightHistory(): Promise<BasicHistory[]> {
    const response = await fetch(baseUrl + "/weight", this.init);
    const data = await handleResponse(response);
    const history = convertToBasicHistory(data);
    history.sort((a, b) => a.date.getTime() - b.date.getTime());
    return history;
  }

  async fetchWeightHistoryWithPeriod(period: number, interval: number): Promise<BasicHistory[]> {
    const response = await fetch(
      baseUrl + "/weight?period=" + period,
      this.init
    );
    const data = await handleResponse(response);
    const history = await convertToBasicHistory(data);
    history.sort((a, b) => a.date.getTime() - b.date.getTime());
    return  (period === 1 && interval === 1) ? history : simpleMovingAverage(history, period, interval);
  }
}

interface HealthResult {
  start: string;
  averageAm: number;
  averagePm: number;
  averagePresumed: number;
}

interface BasicHistory {
  date: Date;
  weight: number;
}

interface UpdateEntryRequest {
  date: string;
  period: string;
  weight: string;
}

interface UpdateEntryResult {
  date: string;
  meridiam: string;
  weight: string;
}

interface DayEntry {
  date: string;
  weightAm: number;
  weightPm: number;
}

function simpleMovingAverage(entries: BasicHistory[], period: number, interval: number): BasicHistory[] {
  let results: BasicHistory[] = [];

  const daysInWindow = period * interval;
  const earliestDate = entries[0].date;
  const latestDate = entries[entries.length - 1].date;

  const daysBetween = (latestDate.valueOf() - earliestDate.valueOf()) / (1000 * 60 * 60 * 24);
  const nWindows = Math.ceil(daysBetween / daysInWindow);

  const windows = [...Array(daysBetween).keys()]
    .map(d => ({
      start: addDays(earliestDate, d),
      end: addDays(earliestDate, d + daysInWindow - 1)
    }))
  
  for (const window of windows) {
    const entriesInWindow = entries.filter(
      e => window.start <= e.date && e.date < window.end
    );

    if (entriesInWindow.length < interval / 10) {
      continue
    }

    const sum = entriesInWindow.reduce((prev, curr) => prev + curr.weight, 0);
    const average = sum / entriesInWindow.length;
    
    results.push({
      date: addDays(window.start, Math.ceil(interval / 2)),
      weight: average
    })
  }

  return results.filter(r => !isNaN(r.weight));
}

function addDays(date: Date, days: number) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}