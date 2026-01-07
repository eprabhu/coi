export function compareString(base, current) {
    base = base ? base : '';
    current = current ? current : '';
    base = base.replace(/\s+$/, '');
    base = base.replace(/<[^>]*>/g, '');
    base = base.replace(/&nbsp;/g, ' ')
    current = current.replace(/&nbsp;/g, ' ')
    current = current.replace(/\s+$/, '');
    current = current.replace(/<[^>]*>/g, '');
    const out = diff(base === '' ? [] : base.split(/\s+/), current === '' ? [] : current.split(/\s+/));
    let str = '';
    let oSpace = base.match(/\s+/g);
    if (oSpace == null) {
      oSpace = [''];
    } else {
      oSpace.push('');
    }
    let nSpace = current.match(/\s+/g);
    if (nSpace == null) {
      nSpace = [''];
    } else {
      nSpace.push('');
    }
    if (out.current.length === 0) {
      for (let i = 0; i < out.base.length; i++) {
        str += '<del>' + out.base[i] + oSpace[i] + '</del>';
      }
    } else {
      if (out.current[0].text == null) {
        for (current = 0; current < out.base.length && out.base[current].text == null; current++) {
          str += '<del>' + out.base[current] + oSpace[current] + '</del>';
        }
      }
      for (let i = 0; i < out.current.length; i++) {
        if (out.current[i].text == null) {
          str += '<ins>' + out.current[i] + nSpace[i] + '</ins>';
        } else {
          let pre = '';
          for (
            current = out.current[i].row + 1;
            current < out.base.length && out.base[current].text == null;
            current++
          ) {
            pre += '<del>' + out.base[current] + oSpace[current] + '</del>';
          }
          str += '' + out.current[i].text + nSpace[i] + pre;
        }
      }
    }
    return str;
}
function diff(base, current) {
    const newStringObject = new Object();
    const oldStringObject = new Object();
    for (let i = 0; i < current.length; i++) {
      if (newStringObject[current[i]] == null) {
        newStringObject[current[i]] = { rows: new Array(), base: null };
      }
      newStringObject[current[i]].rows.push(i);
    }
    for (let i = 0; i < base.length; i++) {
      if (oldStringObject[base[i]] == null) {
        oldStringObject[base[i]] = { rows: new Array(), current: null };
      }
      oldStringObject[base[i]].rows.push(i);
    }
    for (const i in newStringObject) {
      if (
        newStringObject[i].rows.length === 1 &&
        typeof oldStringObject[i] !== 'undefined' &&
        oldStringObject[i].rows.length === 1
      ) {
        current[newStringObject[i].rows[0]] = { text: current[newStringObject[i].rows[0]], row: oldStringObject[i].rows[0] };
        base[oldStringObject[i].rows[0]] = { text: base[oldStringObject[i].rows[0]], row: newStringObject[i].rows[0] };
      }
    }
    for (let i = 0; i < current.length - 1; i++) {
      if (
        current[i].text != null &&
        current[i + 1].text == null &&
        current[i].row + 1 < base.length &&
        base[current[i].row + 1].text == null &&
        current[i + 1] === base[current[i].row + 1]
      ) {
        current[i + 1] = { text: current[i + 1], row: current[i].row + 1 };
        base[current[i].row + 1] = { text: base[current[i].row + 1], row: i + 1 };
      }
    }
    for (let i = current.length - 1; i > 0; i--) {
      if (current[i].text != null && current[i - 1].text == null && current[i].row > 0 &&
      base[current[i].row - 1].text == null && current[i - 1] === base[current[i].row - 1]) {
         current[i - 1] = { text: current[i - 1], row: current[i].row - 1};
         base[current[i].row - 1] = { text: base[current[i].row - 1], row: i - 1 };
      }
    }
    return { base, current };
}
