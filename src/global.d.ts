export {};

declare global {
  interface Window {
    saveDetails: () => void;
    editDetails: () => void;
  }
}