function resizeView(v, w) {
  v.width(w)
    .height(w / 1.61)
    .run();
}

function resize(v) {
  let w = v.container().offsetWidth;
  v.width(w)
    .height(w / 1.61)
    .run();
}

export class ChartSizeManager {
  constructor() {
    this.views = [];
    window.addEventListener('resize', () => {
      this.views.forEach(resize);
    });
  }

  add(view) {
    this.views.push(view);
    resize(view);
  }
}


