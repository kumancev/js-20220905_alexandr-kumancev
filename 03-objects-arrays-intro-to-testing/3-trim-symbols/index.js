/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  let arr = [];
  let count = 0;

  if (size === 0) {
    return ``;
  }

  if (size === undefined) {
    return string;
  }
  
  for (const char of string) {
    if (arr[arr.length - 1] === char) {
      if (count < size) {
        arr.push(char);
        count++;
      }     
    } else {
      count = 1;
      arr.push(char);
    }
  }
  return arr.join('');
}
