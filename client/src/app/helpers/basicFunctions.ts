export class BasicFunctions {
  static deepEqual(obj1: any, obj2: any) {
    if (obj1 === obj2) {
      return true;
    }
  
    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
      return false;
    }
  
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
  
    if (keys1.length !== keys2.length) {
      return false;
    }
  
    for (let key of keys1) {
      if (!obj2.hasOwnProperty(key) || !this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
  
    return true;
  }
  
  static deepCopy(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      const newArray: any[] = [];
      for (const item of obj) {
        newArray.push(this.deepCopy(item));
      }
      return newArray;
    }
  
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = this.deepCopy(obj[key]);
      }
    }
  
    return newObj;
  }

  static bytesToMegabytes(bytes: number, decimalPlaces: number) {
    return (bytes / (1024 * 1024)).toFixed(decimalPlaces);
  }
}