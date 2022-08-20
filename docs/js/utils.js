const createElement = (tagName) => {
  return ({ text = "", attr = {}, dataset = {}, cls = [] }) => {
    const elm = document.createElement(tagName);
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

export { createElement };
