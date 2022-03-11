import type { View } from "vega-typings";

function resize(v: View) {
  const container = v.container();
  if (container !== null) {
    let w = container.offsetWidth;
    let h = container.offsetHeight;
    return v.width(w).height(h).resize().run();
  } else {
    throw new Error("No container to resize");
  }
}

export class ChartSizeManager {
  views: View[];
  constructor() {
    this.views = [];
    window.addEventListener("resize", () => {
      this.views.forEach((v) => {
        resize(v);
      });
    });
  }

  add(view: View) {
    this.views.push(view);
    resize(view);
  }

  resize(view: View) {
    resize(view);
  }
}
