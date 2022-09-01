class LocalDB {
  static localName = 'PHOTO_FRONT_DB';

  static getFull(): object {
    const dataStr = localStorage.getItem(LocalDB.localName) || '';
    try {
      return JSON.parse(dataStr) || {};
    } catch (e) {
      return {};
    }
  }

  static get(key: string, initialValue?: any) {
    const data = LocalDB.getFull();
    return data[key] ?? initialValue;
  }

  static setFull(data: object) {
    if (!data || typeof data !== 'object') {
      throw Error('LocalDB.setFull "data" required type is object!');
    }
    localStorage.setItem(LocalDB.localName, JSON.stringify(data));
  }

  static set(key: string, value) {
    const data = LocalDB.getFull();
    LocalDB.setFull({
      ...data,
      [key]: value
    });
    return value;
  }

  static remove(key: string) {
    const data = LocalDB.getFull();
    delete data[key];
    LocalDB.setFull(data);
  }

  constructor(public scope: string, initialValue) {
    if (!LocalDB.get(scope)) {
      LocalDB.set(scope, initialValue);
    }
  }

  setFull(data) {
    LocalDB.set(this.scope, data);
    this.watchCallbacks.forEach(callback => callback(data));
    return this;
  }

  set(key: string, value: any) {
    const scopeData = LocalDB.get(this.scope);
    if (Array.isArray(scopeData)) {
      console.warn(`scope[${this.scope}] 值为 Array 请使用 setFull 方法更新值`);
      return;
    }
    this.setFull({
      ...scopeData,
      [key]: value
    });
    return this;
  }

  getFull(): object {
    return LocalDB.get(this.scope);
  }

  get(key: string, initialValue?) {
    return this.getFull()?.[key] || initialValue;
  }

  remove(key: string | number) {
    const scopeData = this.getFull();
    if (Array.isArray(scopeData) && typeof key === 'number') {
      // 如果是数组的话 key 就为 index
      scopeData.splice(key, 1);
    } else {
      delete scopeData[key];
    }
    this.setFull(scopeData);
    return this;
  }

  clear() {
    LocalDB.remove(this.scope);
  }

  // 监听变化
  watchCallbacks: Function[] = [];
  watch(callback: Function) {
    if (!this.watchCallbacks.find(call => call === callback)) {
      this.watchCallbacks.push(callback);
    }
  }
  removeWatch(callback: Function) {
    let index;
    if ((index = this.watchCallbacks.indexOf(callback) !== -1)) {
      this.watchCallbacks.splice(index, 1);
    }
  }
}

export default LocalDB;
