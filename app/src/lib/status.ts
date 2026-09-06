import type { BatchStatus, GrievanceStatus, OrderStatus, SlaState, VerificationStatus } from '../types';

export type PillTone = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatusMeta {
  label: string;
  icon: string;
  tone: PillTone;
}

/** Single source of truth: every status pill in the app reads from these maps. */
export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pickup_requested: { label: 'Pickup requested', icon: 'schedule_send', tone: 'neutral' },
  pickup_accepted: { label: 'Pickup accepted', icon: 'task_alt', tone: 'neutral' },
  picked_up: { label: 'Shipment picked up', icon: 'inventory_2', tone: 'secondary' },
  reached_origin_hub: { label: 'Reached origin hub', icon: 'warehouse', tone: 'secondary' },
  assistant_assigned: { label: 'Assistant assigned', icon: 'badge', tone: 'secondary' },
  out_for_delivery: { label: 'Out for delivery', icon: 'local_shipping', tone: 'primary' },
  delivered: { label: 'Delivered', icon: 'check_circle', tone: 'success' },
  pod_uploaded: { label: 'PoD uploaded', icon: 'verified', tone: 'success' },
  on_hold_verification_failed: { label: 'On hold — verification failed', icon: 'gpp_bad', tone: 'danger' },
  on_hold_data_error: { label: 'On hold — data error', icon: 'error', tone: 'danger' },
  rescheduled: { label: 'Rescheduled', icon: 'event_repeat', tone: 'warning' },
  cancelled: { label: 'Cancelled', icon: 'cancel', tone: 'neutral' },
};

export const BATCH_STATUS_META: Record<BatchStatus, StatusMeta> = {
  validation_pending: { label: 'Validation pending', icon: 'hourglass_top', tone: 'neutral' },
  has_errors: { label: 'Has errors', icon: 'report', tone: 'danger' },
  confirmed: { label: 'Confirmed', icon: 'verified', tone: 'success' },
};

export const SLA_STATE_META: Record<SlaState, StatusMeta> = {
  within_sla: { label: 'Within SLA', icon: 'check_circle', tone: 'success' },
  at_risk: { label: 'At risk', icon: 'warning', tone: 'warning' },
  breached: { label: 'Breached', icon: 'error', tone: 'danger' },
};

export const GRIEVANCE_STATUS_META: Record<GrievanceStatus, StatusMeta> = {
  open: { label: 'Open', icon: 'mark_email_unread', tone: 'danger' },
  in_progress: { label: 'In progress', icon: 'sync', tone: 'warning' },
  resolved: { label: 'Resolved', icon: 'check_circle', tone: 'success' },
};

export const VERIFICATION_STATUS_META: Record<VerificationStatus, StatusMeta> = {
  pending: { label: 'Pending', icon: 'radio_button_unchecked', tone: 'neutral' },
  passed: { label: 'Passed', icon: 'check_circle', tone: 'success' },
  failed: { label: 'Failed', icon: 'cancel', tone: 'danger' },
};

export const VERIFICATION_STEP_LABEL: Record<string, string> = {
  unique_code: 'Unique / voucher code',
  mobile_otp: 'Mobile OTP',
  aadhaar_last4: 'Aadhaar (last 4 digits)',
};

export const RESCHEDULE_REASON_LABEL: Record<string, string> = {
  beneficiary_unavailable: 'Beneficiary unavailable',
  travel_delay: 'Travel / weather delay',
  address_incomplete: 'Address incomplete or unreachable',
  requested_by_beneficiary: 'Rescheduled at beneficiary request',
  local_disruption: 'Local disruption (event/holiday/access restriction)',
};

export const TONE_CLASSES: Record<PillTone, { bg: string; text: string; icon: string }> = {
  primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'text-primary-500' },
  secondary: { bg: 'bg-secondary-50', text: 'text-secondary-700', icon: 'text-secondary-500' },
  success: { bg: 'bg-success-bg', text: 'text-[#1F7A57]', icon: 'text-success' },
  warning: { bg: 'bg-warning-bg', text: 'text-[#8A6410]', icon: 'text-warning' },
  danger: { bg: 'bg-danger-bg', text: 'text-[#A63F30]', icon: 'text-danger' },
  neutral: { bg: 'bg-surface-subtle', text: 'text-ink-muted', icon: 'text-ink-faint' },
};
