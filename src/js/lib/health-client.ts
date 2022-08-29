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
  const am = results.map((r) => ({
    date: new Date(r.start),
    weight: r.averageAm,
    period: "AM",
  }));

  const pm = results.map((r) => ({
    date: new Date(r.start),
    weight: r.averagePm,
    period: "PM",
  }));

  return am.concat(pm).filter((r) => r.weight !== null);
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

  async fetchWeightHistoryWithPeriod(period: number): Promise<BasicHistory[]> {
    const response = await fetch(
      baseUrl + "/weight?period=" + period,
      this.init
    );
    const data = await handleResponse(response);
    const history = await convertToBasicHistory(data);
    history.sort((a, b) => a.date.getTime() - b.date.getTime());
    return history;
  }
}

interface HealthResult {
  start: string;
  averageAm: number;
  averagePm: number;
}

interface BasicHistory {
  date: Date;
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
