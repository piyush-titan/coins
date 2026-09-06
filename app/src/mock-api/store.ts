import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActivityLogEntry,
  Batch,
  ContactDirectoryEntry,
  NotificationEntry,
  Order,
  OrderStatus,
  Role,
  ValidationError,
} from '../types';
import { ORDER_STATUS_SEQUENCE } from '../types';
import { generateSeed } from './seed';

interface DemoState {
  role: Role;
  batches: Batch[];
  orders: Order[];
  validationErrors: ValidationError[];
  contacts: ContactDirectoryEntry[];
  activityLog: ActivityLogEntry[];
  notifications: NotificationEntry[];
  reducedMotion: boolean;
  hasOnboarded: boolean;

  setRole: (role: Role) => void;
  setReducedMotion: (v: boolean) => void;
  completeOnboarding: () => void;
  advanceOrderStatus: (orderId: string) => void;
  confirmBatch: (batchId: string) => void;
  simulateUpload: (fileName: string, outcome: 'clean' | 'errors') => Batch;
  resetDemoData: () => void;
  logActivity: (actor: string, action: string, target: string) => void;
}

function seededState() {
  const seed = generateSeed();
  return {
    batches: seed.batches,
    orders: seed.orders,
    validationErrors: seed.validationErrors,
    contacts: seed.contacts,
    activityLog: [
      { id: 'act-1', actor: 'Titan Admin — M. Bharath Kumar', action: 'Exported', target: 'All delivered this month (CSV)', timestamp: new Date(Date.now() - 3 * 3600_000).toISOString() },
      { id: 'act-2', actor: 'Titan Admin — M. Bharath Kumar', action: 'Confirmed batch', target: 'BATCH-2026-08-0007', timestamp: new Date(Date.now() - 2 * 86400_000).toISOString() },
      { id: 'act-3', actor: 'TN Govt — A. Vasantha Devi', action: 'Viewed', target: 'Grievance case GRV-40213', timestamp: new Date(Date.now() - 5 * 86400_000).toISOString() },
      { id: 'act-4', actor: 'Titan Admin — R. Kalaiselvi', action: 'Reverse lookup', target: 'AWB SEQ4821093345', timestamp: new Date(Date.now() - 6 * 86400_000).toISOString() },
    ],
    notifications: [
      { id: 'notif-1', title: 'Batch confirmed', body: 'BATCH-2026-08-0007 was confirmed and orders were created.', timestamp: new Date(Date.now() - 2 * 86400_000).toISOString(), read: false },
      { id: 'notif-2', title: 'Validation errors found', body: 'BATCH-2026-08-0008 has 5 errors and needs correction.', timestamp: new Date(Date.now() - 86400_000).toISOString(), read: false },
      { id: 'notif-3', title: 'New batch uploaded', body: 'BATCH-2026-09-0009 was uploaded and is validating.', timestamp: new Date().toISOString(), read: true },
    ],
  };
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set, get) => ({
      role: 'tn_govt',
      reducedMotion: false,
      hasOnboarded: false,
      ...seededState(),

      setRole: (role) => set({ role }),
      setReducedMotion: (v) => set({ reducedMotion: v }),
      completeOnboarding: () => set({ hasOnboarded: true }),

      logActivity: (actor, action, target) => {
        set((state) => ({
          activityLog: [
            { id: `act-${Date.now()}`, actor, action, target, timestamp: new Date().toISOString() },
            ...state.activityLog,
          ].slice(0, 50),
        }));
      },

      advanceOrderStatus: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o;
            const idx = ORDER_STATUS_SEQUENCE.indexOf(o.status);
            if (idx === -1 || idx >= ORDER_STATUS_SEQUENCE.length - 1) return o;
            const nextStatus: OrderStatus = ORDER_STATUS_SEQUENCE[idx + 1];
            return {
              ...o,
              status: nextStatus,
              statusHistory: [...o.statusHistory, { status: nextStatus, timestamp: new Date().toISOString() }],
              verification: nextStatus === 'delivered' || nextStatus === 'pod_uploaded'
                ? o.verification.map((v) => ({ ...v, status: 'passed' as const, timestamp: new Date().toISOString() }))
                : o.verification,
              pod: (nextStatus === 'delivered' || nextStatus === 'pod_uploaded')
                ? {
                    coinSerialNumber: `GC-${Math.floor(100000 + Math.random() * 899999)}-TN`,
                    signatureImageUrl: 'placeholder:signature',
                    beneficiaryWithCoinPhotoUrl: 'placeholder:beneficiary-coin',
                    idPhotoUrl: 'placeholder:id-masked',
                    gpsLat: 8 + Math.random() * 5,
                    gpsLng: 77 + Math.random() * 3,
                    capturedAt: new Date().toISOString(),
                  }
                : o.pod,
            };
          }),
        }));
        get().logActivity('Dev control panel', 'Simulated next event', orderId);
      },

      confirmBatch: (batchId) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === batchId ? { ...b, status: 'confirmed', confirmedAt: new Date().toISOString() } : b,
          ),
        }));
        get().logActivity(get().role === 'titan_admin' ? 'Titan Admin' : 'TN Govt', 'Confirmed batch', batchId);
      },

      simulateUpload: (fileName, outcome) => {
        const state = get();
        const seq = state.batches.length + 1;
        const now = new Date();
        const id = `BATCH-2026-${String(now.getMonth() + 1).padStart(2, '0')}-${String(1000 + seq).slice(-4)}`;
        const newBatch: Batch = {
          id,
          uploadedAt: now.toISOString(),
          uploadedFileName: fileName,
          status: outcome === 'clean' ? 'validation_pending' : 'has_errors',
          totalRecords: outcome === 'clean' ? 32 : 18,
          errorCount: outcome === 'clean' ? 0 : 5,
          slaWindowDays: 7,
          districtSpread: ['Chennai', 'Coimbatore'],
        };
        const newErrors: ValidationError[] = outcome === 'errors'
          ? [
              { batchId: id, rowNumber: 2, field: 'Primary Mobile Number', message: 'Must be exactly 10 digits.' },
              { batchId: id, rowNumber: 5, field: 'Pincode', message: 'Must be exactly 6 digits.' },
              { batchId: id, rowNumber: 6, field: 'Receiver Name', message: 'Mandatory field is empty.' },
              { batchId: id, rowNumber: 6, field: 'Unique/Voucher Code', message: 'Duplicate of row 1 within this file.' },
              { batchId: id, rowNumber: 11, field: 'Identity Verification (Aadhaar last 4)', message: 'Must be exactly 4 digits.' },
            ]
          : [];
        set({
          batches: [{ ...newBatch, status: outcome === 'clean' ? 'validation_pending' : 'has_errors' }, ...state.batches],
          validationErrors: [...newErrors, ...state.validationErrors],
        });
        // After a short beat, flip clean batches to validation_pending -> unconfirmed clean state so the
        // "confirm this batch" gate is reachable without waiting on a real parse step.
        setTimeout(() => {
          if (outcome === 'clean') {
            set((s) => ({
              batches: s.batches.map((b) => (b.id === id ? { ...b, status: 'validation_pending' } : b)),
            }));
          }
        }, 50);
        get().logActivity(get().role === 'titan_admin' ? 'Titan Admin' : 'TN Govt', 'Uploaded batch', fileName);
        return newBatch;
      },

      resetDemoData: () => {
        set({ ...seededState(), role: get().role });
      },
    }),
    {
      name: 'gold-coin-platform-demo-store',
      partialize: (state) => ({
        role: state.role,
        batches: state.batches,
        orders: state.orders,
        validationErrors: state.validationErrors,
        contacts: state.contacts,
        activityLog: state.activityLog,
        notifications: state.notifications,
        reducedMotion: state.reducedMotion,
        hasOnboarded: state.hasOnboarded,
      }),
    },
  ),
);
