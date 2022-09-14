/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArray = path.split('.');

  return (obj) => {
    let res = obj;

    for (const item of pathArray) {
      if (res) {
        res = res[item];
      }
    }

    return res;
  };
}
