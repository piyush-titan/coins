// Deterministic seed data for the mock-api layer. A fixed PRNG seed keeps the
// dataset stable across reloads until the user resets or the store's dev
// controls mutate it — this stands in for the "static JSON fixtures" the
// build plan describes, generated programmatically so every required edge
// case (SLA states, verification failures, reschedules, grievances) is
// guaranteed present rather than hoped-for from random sampling.
import type {
  Batch,
  ContactDirectoryEntry,
  GrievanceCase,
  Order,
  OrderStatus,
  ValidationError,
  VerificationStepResult,
} from '../types';
import { ORDER_STATUS_SEQUENCE } from '../types';

// mulberry32 PRNG — small, fast, deterministic.
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260801);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

const FIRST_NAMES = [
  'Priya', 'Lakshmi', 'Kavya', 'Divya', 'Anitha', 'Meena', 'Shalini', 'Revathi', 'Deepika', 'Nandhini',
  'Suriya', 'Karthik', 'Vignesh', 'Arun', 'Bala', 'Dinesh', 'Ganesh', 'Hari', 'Iniyan', 'Jeeva',
  'Swetha', 'Pavithra', 'Ramya', 'Saranya', 'Tamil Selvi', 'Vidhya', 'Yamuna', 'Aishwarya', 'Bhavani', 'Chitra',
];
const LAST_NAMES = [
  'S', 'R', 'K', 'M', 'V', 'Devi', 'Priya', 'Kumari', 'Selvam', 'Murugan',
];
const DISTRICTS_ACCESSIBLE = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Erode', 'Vellore', 'Thanjavur'];
const DISTRICTS_REMOTE = ['Nagapattinam', 'Ramanathapuram', 'The Nilgiris', 'Tiruvannamalai', 'Dindigul'];
const VILLAGE_TALUKS = ['Ambattur', 'Avinashi', 'Melur', 'Lalgudi', 'Attur', 'Perundurai', 'Gudiyatham', 'Kumbakonam', 'Vedaranyam', 'Paramakudi', 'Udhagamandalam', 'Polur', 'Palani'];
const STREETS = ['Gandhi Street', 'Anna Salai Cross Street', 'Bharathiyar Nagar', 'Kamarajar Road', 'Periyar Street', 'VOC Nagar Main Road', 'Nehru Street', 'Kalaignar Karunanidhi Street'];
const AREAS = ['Reserve Line', 'New Colony', 'North Extension', 'Railway Feeder Road', 'Market Area', 'West Ward', 'Housing Board Colony'];
const LANDMARKS = ['Near Government Hospital', 'Opp. Panchayat Office', 'Behind Bus Stand', 'Near Amman Temple', 'Next to Ration Shop', undefined, undefined];
const RESCHEDULE_REASONS = ['beneficiary_unavailable', 'travel_delay', 'address_incomplete', 'requested_by_beneficiary', 'local_disruption'];
const GRIEVANCE_CATEGORIES = ['Coin not received', 'Wrong coin weight/quality concern', 'Delivery delay complaint', 'Verification dispute', 'Address / contact update request'];

let orderSeq = 1;
function nextOrderId(): string {
  const id = `TN-GC-2026-${String(orderSeq).padStart(6, '0')}`;
  orderSeq += 1;
  return id;
}

function randomMobile(): string {
  return `9${int(400000000, 899999999)}`;
}

function randomPincode(remote: boolean): string {
  const prefix = remote ? pick(['614', '623', '643', '606']) : pick(['600', '641', '625', '620', '636', '638', '632', '613']);
  return `${prefix}${int(100, 999)}`;
}

function randomAadhaarLast4(): string {
  return String(int(1000, 9999));
}

function randomUniqueCode(): string {
  return `TNGC${int(100000, 999999)}`;
}

function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function isoDaysFromNow(days: number, hour = 10, minute = 0): string {
  return isoDaysAgo(-days, hour, minute);
}

function buildAddress(remote: boolean) {
  const district = remote ? pick(DISTRICTS_REMOTE) : pick(DISTRICTS_ACCESSIBLE);
  return {
    doorNo: String(int(1, 220)),
    building: rand() > 0.6 ? `${pick(['Sri', 'Amman', 'Murugan', 'Vinayagar'])} Flats` : undefined,
    street: pick(STREETS),
    area: pick(AREAS),
    landmark: pick(LANDMARKS),
    villageTaluk: pick(VILLAGE_TALUKS),
    cityTown: district,
    district,
    pincode: randomPincode(remote),
  };
}

interface GenOrderOpts {
  batchId: string;
  slaWindowDays: 7 | 14;
  slaStartDate: string;
  remote: boolean;
  forcedStatus?: OrderStatus;
  forceReschedule?: boolean;
  forceGrievance?: boolean;
  forceVerificationFail?: VerificationFailKind;
  ageOverrideDays?: number; // how far the status history should look "back" from now
}

type VerificationFailKind = 'unique_code' | 'mobile_otp' | 'aadhaar_last4' | null;

function buildStatusHistory(status: OrderStatus, slaStartDate: string, holdAtStep?: number): { status: OrderStatus; timestamp: string }[] {
  const startDate = new Date(slaStartDate);
  const history: { status: OrderStatus; timestamp: string }[] = [];
  const targetIndex = status === 'rescheduled' || status === 'cancelled'
    ? int(1, 4)
    : ORDER_STATUS_SEQUENCE.indexOf(status) >= 0
      ? ORDER_STATUS_SEQUENCE.indexOf(status)
      : 3;
  const cutoff = holdAtStep ?? targetIndex;
  for (let i = 0; i <= cutoff && i < ORDER_STATUS_SEQUENCE.length; i += 1) {
    const t = new Date(startDate);
    t.setHours(9 + i * 6, int(0, 59), 0, 0);
    t.setDate(t.getDate() + Math.floor(i / 2));
    history.push({ status: ORDER_STATUS_SEQUENCE[i], timestamp: t.toISOString() });
  }
  if (status === 'rescheduled' || status === 'cancelled') {
    const t = new Date(startDate);
    t.setDate(t.getDate() + cutoff + 1);
    history.push({ status, timestamp: t.toISOString() });
  }
  return history;
}

function buildOrder(opts: GenOrderOpts): Order {
  const { batchId, slaWindowDays, slaStartDate, remote, forceReschedule, forceGrievance, forceVerificationFail } = opts;
  const id = nextOrderId();
  const receiverName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const address = buildAddress(remote);

  let status: OrderStatus = opts.forcedStatus ?? pick([
    'pickup_requested', 'pickup_accepted', 'picked_up', 'reached_origin_hub',
    'assistant_assigned', 'out_for_delivery', 'delivered', 'pod_uploaded', 'delivered', 'pod_uploaded',
  ]);

  const verification: VerificationStepResult[] = [
    { step: 'aadhaar_last4', status: 'pending' },
    { step: 'mobile_otp', status: 'pending' },
    { step: 'unique_code', status: 'pending' },
  ];

  const reschedules = [];
  let pod: Order['pod'] | undefined;
  let holdAtStep: number | undefined;

  const deliveredLike = status === 'delivered' || status === 'pod_uploaded';

  if (forceVerificationFail) {
    status = 'on_hold_verification_failed';
    holdAtStep = 5; // out_for_delivery reached, then failed at handover
    const handoverAt = isoDaysAgo(int(0, 3));
    verification.forEach((v) => {
      if (v.step === forceVerificationFail) {
        v.status = 'failed';
        (v as { failureReason?: string }).failureReason =
          forceVerificationFail === 'unique_code'
            ? 'Voucher code entered did not match TN Govt records for this beneficiary.'
            : forceVerificationFail === 'mobile_otp'
              ? 'OTP was not confirmed within the attempt window (signal issue reported by delivery assistant).'
              : 'Last 4 Aadhaar digits provided did not match the uploaded record.';
        (v as { timestamp?: string }).timestamp = handoverAt;
      } else {
        v.status = 'passed';
        (v as { timestamp?: string }).timestamp = handoverAt;
      }
    });
  } else if (deliveredLike) {
    const handoverAt = isoDaysAgo(int(0, 6));
    verification.forEach((v) => {
      v.status = 'passed';
      (v as { timestamp?: string }).timestamp = handoverAt;
    });
    pod = {
      coinSerialNumber: `GC-${int(100000, 999999)}-TN`,
      signatureImageUrl: 'placeholder:signature',
      beneficiaryWithCoinPhotoUrl: 'placeholder:beneficiary-coin',
      idPhotoUrl: 'placeholder:id-masked',
      gpsLat: 8 + rand() * 5,
      gpsLng: 77 + rand() * 3,
      capturedAt: handoverAt,
    };
  }

  if (forceReschedule) {
    status = 'rescheduled';
    const prev = isoDaysAgo(int(2, 6));
    reschedules.push({
      previousDate: prev,
      newDate: isoDaysFromNow(int(1, 4)),
      reasonCode: pick(RESCHEDULE_REASONS),
      triggeredAt: pick(['availability_call', 'delivery_attempt'] as const),
      loggedAt: isoDaysAgo(int(0, 2)),
    });
  }

  if (status === 'on_hold_data_error') {
    holdAtStep = 1;
  }

  const statusHistory = buildStatusHistory(status, slaStartDate, holdAtStep);

  let grievance: GrievanceCase | undefined;
  if (forceGrievance) {
    const grStatus = pick(['open', 'in_progress', 'resolved'] as const);
    grievance = {
      id: `GRV-${int(10000, 99999)}`,
      orderId: id,
      category: pick(GRIEVANCE_CATEGORIES),
      description: pick([
        'Beneficiary reports the delivery assistant has not called back after the last attempt.',
        'Beneficiary states the coin weight looked different from what was announced at the camp.',
        'Beneficiary requests re-verification as OTP was sent to an old number.',
        'Beneficiary disputes the verification failure outcome and wants a re-attempt.',
        'Family member called on beneficiary\'s behalf asking to update the delivery address.',
      ]),
      status: grStatus,
      resolutionOutcome: grStatus === 'resolved' ? pick([
        'Re-attempt scheduled and completed successfully; coin delivered.',
        'Confirmed with beneficiary directly by phone; no further action needed.',
        'Address corrected and delivery re-attempted successfully.',
      ]) : undefined,
      createdAt: isoDaysAgo(int(1, 10)),
      updatedAt: isoDaysAgo(int(0, 3)),
    };
  }

  return {
    id,
    batchId,
    awb: status === 'pickup_requested' ? undefined : `SEQ${int(1000000000, 9999999999)}`,
    receiverName,
    primaryMobile: randomMobile(),
    alternateMobile: rand() > 0.4 ? randomMobile() : undefined,
    aadhaarLast4: randomAadhaarLast4(),
    uniqueCode: randomUniqueCode(),
    address,
    slaWindowDays,
    slaStartDate,
    status,
    statusHistory,
    verification,
    pod,
    reschedules,
    grievance,
  };
}

export interface SeedResult {
  batches: Batch[];
  orders: Order[];
  validationErrors: ValidationError[];
  contacts: ContactDirectoryEntry[];
}

export function generateSeed(): SeedResult {
  const batches: Batch[] = [];
  const orders: Order[] = [];
  const validationErrors: ValidationError[] = [];

  // Batch 1 — confirmed, older cycle, mostly wrapped up, 7-day SLA, accessible districts.
  const batch1Upload = isoDaysAgo(18);
  const batch1: Batch = {
    id: 'BATCH-2026-06-0005',
    uploadedAt: batch1Upload,
    uploadedFileName: 'TN_GoldCoin_Beneficiaries_June_Cycle2.xlsx',
    status: 'confirmed',
    totalRecords: 28,
    errorCount: 0,
    confirmedAt: isoDaysAgo(17),
    slaWindowDays: 7,
    districtSpread: DISTRICTS_ACCESSIBLE.slice(0, 4),
  };
  batches.push(batch1);
  for (let i = 0; i < 24; i += 1) {
    orders.push(buildOrder({ batchId: batch1.id, slaWindowDays: 7, slaStartDate: batch1Upload, remote: false, forcedStatus: pick(['delivered', 'pod_uploaded', 'pod_uploaded']) }));
  }
  orders.push(buildOrder({ batchId: batch1.id, slaWindowDays: 7, slaStartDate: batch1Upload, remote: false, forceGrievance: true, forcedStatus: 'pod_uploaded' }));
  orders.push(buildOrder({ batchId: batch1.id, slaWindowDays: 7, slaStartDate: batch1Upload, remote: false, forceGrievance: true, forcedStatus: 'delivered' }));
  orders.push(buildOrder({ batchId: batch1.id, slaWindowDays: 7, slaStartDate: batch1Upload, remote: false, forcedStatus: 'cancelled' }));
  orders.push(buildOrder({ batchId: batch1.id, slaWindowDays: 7, slaStartDate: batch1Upload, remote: false, forcedStatus: 'delivered' }));
  batch1.totalRecords = 28;

  // Batch 2 — confirmed, 14-day SLA remote cycle, in progress, several at-risk/breached.
  const batch2Upload = isoDaysAgo(9);
  const batch2: Batch = {
    id: 'BATCH-2026-07-0006',
    uploadedAt: batch2Upload,
    uploadedFileName: 'TN_GoldCoin_Beneficiaries_RemoteBlock_July.xlsx',
    status: 'confirmed',
    totalRecords: 22,
    errorCount: 0,
    confirmedAt: isoDaysAgo(8),
    slaWindowDays: 14,
    districtSpread: DISTRICTS_REMOTE,
  };
  batches.push(batch2);
  // Breached (9 days elapsed on a 14-day window is not breached; simulate breach via a shorter effective window by placing status behind schedule is not needed —
  // instead we directly force a couple of orders whose SLA window is 7 to guarantee breach/at-risk realism within a remote-labelled batch is inconsistent,
  // so breach/at-risk here comes from slaStartDate pushed further back for a handful of orders.
  const batch2EarlyUpload = isoDaysAgo(15); // for breach/at-risk demonstration within this batch's own 14-day window
  for (let i = 0; i < 12; i += 1) {
    orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2Upload, remote: true, forcedStatus: pick(['out_for_delivery', 'assistant_assigned', 'reached_origin_hub', 'picked_up']) }));
  }
  // 3 breached (uploaded 15 days ago against a 14-day window)
  for (let i = 0; i < 3; i += 1) {
    orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2EarlyUpload, remote: true, forcedStatus: pick(['out_for_delivery', 'assistant_assigned']) }));
  }
  // 3 at-risk (uploaded 12-13 days ago against a 14-day window => 1-2 days remaining)
  const batch2AtRiskUpload = isoDaysAgo(12);
  for (let i = 0; i < 3; i += 1) {
    orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2AtRiskUpload, remote: true, forcedStatus: pick(['out_for_delivery', 'assistant_assigned', 'reached_origin_hub']) }));
  }
  orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2Upload, remote: true, forceVerificationFail: 'mobile_otp' }));
  orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2Upload, remote: true, forceVerificationFail: 'aadhaar_last4' }));
  orders.push(buildOrder({ batchId: batch2.id, slaWindowDays: 14, slaStartDate: batch2Upload, remote: true, forceReschedule: true }));
  batch2.totalRecords = 22;

  // Batch 3 — confirmed, most recent, mixed SLA windows, the "active cycle" with the richest state variety.
  const batch3Upload = isoDaysAgo(3);
  const batch3: Batch = {
    id: 'BATCH-2026-08-0007',
    uploadedAt: batch3Upload,
    uploadedFileName: 'TN_GoldCoin_Beneficiaries_August_Cycle1.xlsx',
    status: 'confirmed',
    totalRecords: 38,
    errorCount: 0,
    confirmedAt: isoDaysAgo(2),
    slaWindowDays: 'mixed',
    districtSpread: [...DISTRICTS_ACCESSIBLE.slice(0, 3), ...DISTRICTS_REMOTE.slice(0, 2)],
  };
  batches.push(batch3);
  for (let i = 0; i < 16; i += 1) {
    orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forcedStatus: pick(['pickup_requested', 'pickup_accepted', 'picked_up', 'reached_origin_hub', 'assistant_assigned', 'out_for_delivery']) }));
  }
  for (let i = 0; i < 12; i += 1) {
    orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 14, slaStartDate: batch3Upload, remote: true, forcedStatus: pick(['pickup_requested', 'pickup_accepted', 'picked_up', 'reached_origin_hub', 'assistant_assigned']) }));
  }
  for (let i = 0; i < 4; i += 1) {
    orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forcedStatus: pick(['delivered', 'pod_uploaded']) }));
  }
  orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forceVerificationFail: 'unique_code' }));
  orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forcedStatus: 'on_hold_data_error' }));
  orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 14, slaStartDate: batch3Upload, remote: true, forceReschedule: true }));
  orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forceReschedule: true }));
  orders.push(buildOrder({ batchId: batch3.id, slaWindowDays: 7, slaStartDate: batch3Upload, remote: false, forceGrievance: true, forcedStatus: 'out_for_delivery' }));
  batch3.totalRecords = 38;

  // Batch 4 — has_errors, unconfirmed, no orders yet. Demonstrates the validation-error screen.
  const batch4Upload = isoDaysAgo(1);
  const batch4: Batch = {
    id: 'BATCH-2026-08-0008',
    uploadedAt: batch4Upload,
    uploadedFileName: 'TN_GoldCoin_Beneficiaries_August_Cycle2_DRAFT.xlsx',
    status: 'has_errors',
    totalRecords: 15,
    errorCount: 5,
    slaWindowDays: 7,
    districtSpread: ['Coimbatore', 'Madurai'],
  };
  batches.push(batch4);
  validationErrors.push(
    { batchId: batch4.id, rowNumber: 4, field: 'Primary Mobile Number', message: 'Must be exactly 10 digits — found 9 digits.', receiverName: 'Kavitha M' },
    { batchId: batch4.id, rowNumber: 7, field: 'Pincode', message: 'Must be exactly 6 digits — found "60003".', receiverName: 'Sundar R' },
    { batchId: batch4.id, rowNumber: 9, field: 'Receiver Name', message: 'Mandatory field is empty.', receiverName: undefined },
    { batchId: batch4.id, rowNumber: 9, field: 'Unique/Voucher Code', message: 'Duplicate of row 3 within this file — codes must be unique per beneficiary.', receiverName: undefined },
    { batchId: batch4.id, rowNumber: 12, field: 'Identity Verification (Aadhaar last 4)', message: 'Must be exactly 4 digits — found letters.', receiverName: 'Prakash V' },
  );

  // Batch 5 — freshly uploaded, still validating, no errors surfaced yet, no orders.
  const batch5: Batch = {
    id: 'BATCH-2026-09-0009',
    uploadedAt: isoDaysAgo(0),
    uploadedFileName: 'TN_GoldCoin_Beneficiaries_September_Cycle1.xlsx',
    status: 'validation_pending',
    totalRecords: 45,
    errorCount: 0,
    slaWindowDays: 7,
    districtSpread: ['Chennai', 'Salem', 'Vellore'],
  };
  batches.push(batch5);

  const contacts: ContactDirectoryEntry[] = [
    { name: 'R. Kalaiselvi (placeholder)', role: 'CBG Finance Lead', organization: 'Titan', phone: '9840012345', email: 'kalaiselvi.r@titan-placeholder.com' },
    { name: 'M. Bharath Kumar (placeholder)', role: 'Platform Developer / Support', organization: 'Titan', phone: '9840012346', email: 'bharath.k@titan-placeholder.com' },
    { name: 'A. Vasantha Devi (placeholder)', role: 'Social Welfare Dept. Coordinator', organization: 'TN Govt', phone: '9445567890', email: 'vasantha.devi@tngovt-placeholder.in' },
    { name: 'S. Muthu Raman (placeholder)', role: 'District Nodal Officer', organization: 'TN Govt', phone: '9445567891' },
    { name: 'Sequel Logistics Helpdesk (placeholder)', role: 'Delivery Operations Helpline', organization: 'Sequel', phone: '1800120456' },
    { name: 'K. Deepak Raj (placeholder)', role: 'Sequel Regional Coordinator', organization: 'Sequel', phone: '9600011223' },
  ];

  return { batches, orders, validationErrors, contacts };
}
