export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0; // tslint:disable-line
    const v = c === 'x' ? r : (r & 0x3 | 0x8); // tslint:disable-line
    return v.toString(16);
  });
}
