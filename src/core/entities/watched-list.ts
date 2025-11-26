export abstract class WatchedList<Props> {
  public currentItems: Props[];
  private initialItems: Props[];
  private newItems: Props[];
  private removedItems: Props[];

  constructor(initialItems?: Props[]) {
    this.currentItems = initialItems || [];
    this.initialItems = initialItems || [];
    this.newItems = [];
    this.removedItems = [];
  }

  abstract compareItems(a: Props, b: Props): boolean;

  public getItems(): Props[] {
    return this.currentItems;
  }

  public getNewItems(): Props[] {
    return this.newItems;
  }

  public getRemovedItems(): Props[] {
    return this.removedItems;
  }

  private isCurrentItem(item: Props): boolean {
    return (
      this.currentItems.filter((value: Props) => this.compareItems(item, value))
        .length !== 0
    );
  }

  private isNewItem(item: Props): boolean {
    return (
      this.newItems.filter((value: Props) => this.compareItems(item, value))
        .length !== 0
    );
  }

  private isRemovedItem(item: Props): boolean {
    return (
      this.removedItems.filter((value: Props) => this.compareItems(item, value))
        .length !== 0
    );
  }

  private removeFromCurrent(item: Props): void {
    this.currentItems = this.currentItems.filter(
      (value) => !this.compareItems(value, item),
    );
  }

  private removeFromNewItems(item: Props): void {
    this.newItems = this.newItems.filter(
      (value) => !this.compareItems(value, item),
    );
  }

  private removeFromRemovedItems(item: Props): void {
    this.removedItems = this.removedItems.filter(
      (value) => !this.compareItems(value, item),
    );
  }

  private wasAddedInitially(item: Props): boolean {
    return (
      this.initialItems.filter((value: Props) => this.compareItems(item, value))
        .length !== 0
    );
  }

  public exists(item: Props): boolean {
    return this.isCurrentItem(item);
  }

  public add(item: Props): void {
    if (this.isRemovedItem(item)) {
      this.removeFromRemovedItems(item);
    }

    if (!this.isNewItem(item) && !this.wasAddedInitially(item)) {
      this.newItems.push(item);
    }

    if (!this.isCurrentItem(item)) {
      this.currentItems.push(item);
    }
  }

  public remove(item: Props): void {
    this.removeFromCurrent(item);

    if (this.isNewItem(item)) {
      this.removeFromNewItems(item);
      return;
    }

    if (!this.isRemovedItem(item)) {
      this.removedItems.push(item);
    }
  }

  public update(items: Props[]): void {
    const newItems = items.filter((a) => {
      return !this.getItems().some((b) => this.compareItems(a, b));
    });

    const removedItems = this.getItems().filter((a) => {
      return !items.some((b) => this.compareItems(a, b));
    });

    this.currentItems = items;
    this.newItems = newItems;
    this.removedItems = removedItems;
  }
}
