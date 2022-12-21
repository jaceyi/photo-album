import Macy from 'macy';

interface Options {
  container: HTMLDivElement;
  margin: number;
  columns: number;
}

class PlanLayout extends Macy {
  constructor(options: Options) {
    super(options);
  }

  computeBeforeEvents: Function[] = [];
  addComputeBefore(callback: Function) {
    this.computeBeforeEvents.push(callback);
  }

  removeComputeBefore(callback: Function) {
    const index = this.computeBeforeEvents.indexOf(callback);
    this.computeBeforeEvents.splice(index, 1);
  }

  dispatchComputeBefore() {
    this.computeBeforeEvents.map(callback => callback());
  }

  computeAfterEvents: Function[] = [];
  addComputeAfter(callback: Function) {
    this.computeAfterEvents.push(callback);
  }

  removeComputeAfter(callback: Function) {
    const index = this.computeAfterEvents.indexOf(callback);
    this.computeAfterEvents.splice(index, 1);
  }

  dispatchComputeAfter() {
    this.computeAfterEvents.map(callback => callback());
  }
}

export default PlanLayout;
