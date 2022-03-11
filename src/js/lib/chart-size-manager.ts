function resize(v) {
  const container = v.container();
  let w = container.offsetWidth;
  let h = container.offsetHeight;
  return v.width(w).height(h).resize().run();
}

export class ChartSizeManager {
  views: any[];
  constructor() {
    this.views = [];
    window.addEventListener("resize", () => {
      this.views.forEach((v) => {
        resize(v);
      });
    });
  }

  add(view) {
    this.views.push(view);
    resize(view);
  }

  resize(view) {
    resize(view);
  }
}
