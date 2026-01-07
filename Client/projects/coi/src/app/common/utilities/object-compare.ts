import { compareString } from './string-compare';

/**@author Mahesh Sreenath V M
 * compares to arrays for given primary key and sub fields
 * base stands for the latest version created and
 * current stands for the current version being compare
 * returns the base after comparison. the base will be updated with new tags to show changes.
*/
export function compareObject(base = {}, current = {}, subFields: Array<string>) {
  base = base ? base : {};
  current = current ? current : {};
  const KEYS = subFields;
  KEYS.forEach((value: string) => {
    const CURRENT = findDataInObject(current, value);
    const BASE = findDataInObject(base, value);
    const COMPARED_VALUE = compareString(updateToString(CURRENT), updateToString(BASE));
    updateComparedData(base, value, COMPARED_VALUE);
  });
  return base;
}

function updateToString(value: string | number | null) {
  return value || value === 0 ? value.toString() : '';
}

function findDataInObject(data: any, path: string) {
  path.split('.').every(p => data[p] || data[p] === 0 ? data = data[p] : false);
  return typeof (data) === 'string' || typeof (data) === 'number' ? data : '';
}

function updateComparedData(data: any, path: string, value: string | number) {
  const paths = path.split('.');
  paths.slice(0, -1).forEach(p => {
    if (data[p] || data[p] === 0) {
      data = data[p]
    } else {
      data[p] = {};
      data = data[p];
    }
  });
  data[paths[paths.length - 1]] = value;
}


