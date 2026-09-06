// Gold Coin Delivery Platform — shared data model.
// Mirrors BRD v1.7 §5/§3 entities. This is a front-end demo: every record here
// is produced by the mock-api layer, never a real backend.

export type Role = 'tn_govt' | 'titan_admin';

export type OrderStatus =
  | 'pickup_requested'
  | 'pickup_accepted'
  | 'picked_up'
  | 'reached_origin_hub'
  | 'assistant_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'pod_uploaded'
  | 'on_hold_verification_failed'
  | 'on_hold_data_error'
  | 'rescheduled'
  | 'cancelled';

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  'pickup_requested',
  'pickup_accepted',
  'picked_up',
  'reached_origin_hub',
  'assistant_assigned',
  'out_for_delivery',
  'delivered',
  'pod_uploaded',
];

export type BatchStatus = 'validation_pending' | 'has_errors' | 'confirmed';

export interface Batch {
  id: string;
  uploadedAt: string;
  uploadedFileName: string;
  status: BatchStatus;
  totalRecords: number;
  errorCount: number;
  confirmedAt?: string;
  slaWindowDays: 7 | 14 | 'mixed';
  districtSpread: string[];
}

export interface ValidationError {
  batchId: string;
  rowNumber: number;
  field: string;
  message: string;
  receiverName?: string;
}

export type VerificationStepName = 'unique_code' | 'mobile_otp' | 'aadhaar_last4';
export type VerificationStatus = 'pending' | 'passed' | 'failed';

export interface VerificationStepResult {
  step: VerificationStepName;
  status: VerificationStatus;
  timestamp?: string;
  failureReason?: string;
}

export interface ProofOfDelivery {
  coinSerialNumber?: string;
  signatureImageUrl?: string;
  beneficiaryWithCoinPhotoUrl?: string;
  idPhotoUrl?: string;
  gpsLat?: number;
  gpsLng?: number;
  capturedAt?: string;
}

export type RescheduleTrigger = 'availability_call' | 'delivery_attempt';

export interface RescheduleEvent {
  previousDate: string;
  newDate: string;
  reasonCode: string;
  triggeredAt: RescheduleTrigger;
  loggedAt: string;
}

export type GrievanceStatus = 'open' | 'in_progress' | 'resolved';

export interface GrievanceCase {
  id: string;
  orderId: string;
  category: string;
  description: string;
  status: GrievanceStatus;
  resolutionOutcome?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderAddress {
  doorNo: string;
  building?: string;
  street: string;
  area: string;
  landmark?: string;
  villageTaluk: string;
  cityTown: string;
  district: string;
  pincode: string;
}

export interface Order {
  id: string;
  batchId: string;
  awb?: string;
  receiverName: string;
  primaryMobile: string;
  alternateMobile?: string;
  aadhaarLast4: string;
  uniqueCode: string;
  address: OrderAddress;
  slaWindowDays: 7 | 14;
  slaStartDate: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string }[];
  verification: VerificationStepResult[];
  pod?: ProofOfDelivery;
  reschedules: RescheduleEvent[];
  grievance?: GrievanceCase;
}

export interface ContactDirectoryEntry {
  name: string;
  role: string;
  organization: 'Titan' | 'Sequel' | 'TN Govt';
  phone: string;
  email?: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface NotificationEntry {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export type SlaState = 'within_sla' | 'at_risk' | 'breached';
