declare module "privy" {
  export interface Privy {
    get(key: string): any;
    set(key: string, value: any): void;
    remove(key: string): void;
  }
}
