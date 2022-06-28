const xmlns = "http://www.w3.org/2000/svg";

const trunc = (f) => Math.trunc(100 * f) / 100;

const createSVGelement = (tagName) => {
  return ({ text = "", attr = {}, dataset = {}, cls = [] }) => {
    const elm = document.createElementNS(xmlns, tagName);
    elm.textContent = text;
    Object.keys(dataset).forEach((key) => {
      elm.dataset[key] = dataset[key];
    });
    Object.keys(attr).forEach((name) => {
      elm.setAttribute(name, attr[name]);
    });
    cls.forEach((name) => {
      elm.classList.add(name);
    });
    return elm;
  };
};

const createSVG = (xRange, yRange) => {
  return createSVGelement("svg")(
    Object.assign(
      {},
      {
        attr: {
          xmlns,
          preserveAspectRatio: "none",
          viewBox: `${xRange[0]} ${yRange[0]} ${xRange[1] - xRange[0]} ${yRange[1] - yRange[0]
            }`,
        },
      }
    )
  );
};
const createText = createSVGelement("text");
const createRect = createSVGelement("rect");
const createPath = createSVGelement("path");
const createCircle = createSVGelement("circle");
const createGroup = createSVGelement("g");

const createScale = (domain, range, shift = 0, pad = 0) => {
  const dLength = domain[1] - domain[0];
  const rLength = Math.abs(range[1] - range[0] - shift - pad);
  return (x) => trunc(shift + (rLength * (x - domain[0])) / dLength);
};

const svgdownload = (filename, svg = null) => {
  const delay = (msec) => new Promise((r) => setTimeout(r, msec));
  svg = svg || document.querySelector("svg");
  const svgData = new XMLSerializer().serializeToString(svg);

  const canvas = document.createElement("canvas");
  canvas.width = svg.width.baseVal.value;
  canvas.height = svg.height.baseVal.value;
  const ctx = canvas.getContext("2d");
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      var a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.setAttribute("download", filename);
      delay(200).then(() => {
        a.dispatchEvent(new MouseEvent("click"));
        console.log(filename);
        resolve(filename);
      });
    };
    image.src = "data:image/svg+xml;charset=utf-8;base64," + window.btoa(svgData);
  });
};

const svgRectFitToText = (g) => {
  const text = g.querySelector("text");
  const rect = g.querySelector("rect");
  const bbox = text.getBBox();
  const xPad = bbox.width * 0.05;
  const yPad = bbox.height * 0.05;

  rect.setAttribute("x", bbox.x - xPad);
  rect.setAttribute("y", bbox.y - yPad);
  rect.setAttribute("width", bbox.width + 2 * xPad);
  rect.setAttribute("height", bbox.height + 2 * yPad);
};

const createTics = (tics) => {
  const {
    xAxis,
    yAxis,
    xTics,
    yTics,
    xTicsPos,
    yTicsPos,
    labelStyle,
    pathStyle,
  } = tics;

  const gTics = createGroup({
    cls: ["tics"],
  });

  const ticsPath = createPath({
    attr: Object.assign({}, pathStyle, {
      d: [
        [
          yTics
            .map((y) => {
              const pos = isNaN(y) ? y.pos : y;
              return `M ${xAxis[0]} ${pos} h ${xAxis[1] - xAxis[0]}`;
            })
            .join(" "),
        ],
        [
          xTics
            .map((x) => {
              const pos = isNaN(x) ? x.pos : x;
              return `M ${pos} ${yAxis[0]} v ${yAxis[1] - yAxis[0]}`;
            })
            .join(" "),
        ],
      ].join(" "),
    }),
    cls: ["tics"],
  });
  gTics.append(ticsPath);

  yTics.forEach((y) => {
    const text = createText({
      text: y.text,
      attr: Object.assign({}, labelStyle, {
        x: xTicsPos,
        y: y.pos,
      }),
      cls: ["ytics"],
    });
    gTics.append(text);
  });

  xTics.forEach((x) => {
    const text = createText({
      text: isNaN(x) ? x.text : x,
      attr: Object.assign({}, labelStyle, {
        x: isNaN(x) ? x.pos : x,
        y: yTicsPos,
      }),
      cls: ["xtics"],
    });
    gTics.append(text);
  });

  return gTics;
};

const createAxis = (axis) => {
  const { lines, pathStyle } = axis;

  const gAxis = createGroup({
    cls: ["axis"],
  });

  const axisPath = createPath({
    attr: Object.assign({}, pathStyle, {
      d: lines
        .map(([st, en]) => {
          return `M ${st[0]} ${st[1]} L ${en[0]} ${en[1]} `;
        })
        .join(" "),
    }),
    cls: ["axis"],
  });
  gAxis.append(axisPath);
  return gAxis;
};

const createTextbox = (obj) => {
  const grp = createGroup({
    cls: ["textbox"],
  });
  const rect = createRect({
    attr: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
  });
  grp.append(rect);
  const textTitle = createText(obj);
  grp.append(textTitle);
  return grp;
};

const createBackgroundRect = (svg) => {
  const rect = svg.viewBox.baseVal;
  return createRect({
    attr: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    cls: ["bgRect"],
  });
};

export {
  trunc,
  createSVG,
  createCircle,
  createGroup,
  createPath,
  createRect,
  createText,
  createTextbox,
  createBackgroundRect,
  createScale,
  svgdownload,
  svgRectFitToText,
  createTics,
  createAxis,
};
