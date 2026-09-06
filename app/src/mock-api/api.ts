import { useDemoStore } from './store';

function delay<T>(value: T): Promise<T> {
  const ms = 300 + Math.random() * 400;
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const api = {
  async getBatches() {
    return delay(useDemoStore.getState().batches);
  },
  async getBatch(id: string) {
    return delay(useDemoStore.getState().batches.find((b) => b.id === id) ?? null);
  },
  async getValidationErrors(batchId: string) {
    return delay(useDemoStore.getState().validationErrors.filter((e) => e.batchId === batchId));
  },
  async getOrders() {
    return delay(useDemoStore.getState().orders);
  },
  async getOrder(id: string) {
    return delay(useDemoStore.getState().orders.find((o) => o.id === id) ?? null);
  },
  async getContacts() {
    return delay(useDemoStore.getState().contacts);
  },
  async getActivityLog() {
    return delay(useDemoStore.getState().activityLog);
  },
  async getNotifications() {
    return delay(useDemoStore.getState().notifications);
  },
};
