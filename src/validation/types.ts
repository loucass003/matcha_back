export type TransferNullability<T, U> = T extends null | undefined
  ? U | null | undefined
  : U;
