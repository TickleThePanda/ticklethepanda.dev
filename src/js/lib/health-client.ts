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
  async fetchWeightHistory(): Promise<BasicHistory[]> {
    const response = await fetch(baseUrl + "/weight");
    const data = await handleResponse(response);
    const history = await convertToBasicHistory(data);
    history.sort((a, b) => a.date.getTime() - b.date.getTime());
    return history;
  }

  async fetchWeightHistoryWithPeriod(period: number): Promise<BasicHistory[]> {
    const response = await fetch(baseUrl + "/weight?period=" + period);
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
