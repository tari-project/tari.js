export class Amount {
  private value: number;

  constructor(value: number) {
    this.value = value;
  }

  public static readonly MAX: Amount = new Amount(Number.MAX_SAFE_INTEGER);

  public static of(amount: number): Amount {
    return new Amount(amount);
  }

  public static zero(): Amount {
    return new Amount(0);
  }

  public isZero(): boolean {
    return this.value === 0;
  }

  public isPositive(): boolean {
    return this.value >= 0;
  }

  public isNegative(): boolean {
    return !this.isPositive();
  }

  public getValue(): number {
    return this.value;
  }

  public getStringValue(): string {
    return this.value.toString();
  }

  public checkedAdd(other: Amount): Amount | null {
    const result = this.value + other.value;
    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER) {
      return null;
    }
    return new Amount(result);
  }

  public saturatingAdd(other: Amount): Amount {
    return new Amount(Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, this.value + other.value)));
  }

  public checkedSub(other: Amount): Amount | null {
    const result = this.value - other.value;
    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER) {
      return null;
    }
    return new Amount(result);
  }

  public saturatingSub(other: Amount): Amount {
    return new Amount(Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, this.value - other.value)));
  }

  public saturatingSubPositive(other: Amount): Amount {
    const result = this.value - other.value;
    return result < 0 ? new Amount(0) : new Amount(result);
  }

  public checkedSubPositive(other: Amount): Amount | null {
    if (this.isNegative() || other.isNegative()) {
      return null;
    }
    if (this.value < other.value) {
      return null;
    }
    return new Amount(this.value - other.value);
  }

  public checkedMul(other: Amount): Amount | null {
    const result = this.value * other.value;
    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER) {
      return null;
    }
    return new Amount(result);
  }

  public saturatingMul(other: Amount): Amount {
    return new Amount(Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, this.value * other.value)));
  }

  public checkedDiv(other: Amount): Amount | null {
    if (other.value === 0) {
      throw new Error("Division by zero");
    }
    const result = this.value / other.value;
    if (result < Number.MIN_SAFE_INTEGER || result > Number.MAX_SAFE_INTEGER) {
      return null;
    }
    return new Amount(result);
  }

  public saturatingDiv(other: Amount): Amount {
    if (other.value === 0) {
      throw new Error("Division by zero");
    }
    return new Amount(Math.min(Number.MAX_SAFE_INTEGER, Math.max(Number.MIN_SAFE_INTEGER, this.value / other.value)));
  }

  public asU64Checked(): number | null {
    if (this.value < 0) {
      return null;
    }
    return this.value as number;
  }

  public toJSON(): number {
    return this.value;
  }
}
