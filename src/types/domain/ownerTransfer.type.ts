import type {
  CertificateType,
  DocumentType,
  ApplicationStatus,
  ApplicationType,
  PaymentStatus,
} from "../enums";
import type { LandView } from "./land.type";
import type { Person, Officer } from "./person.type";

export interface ApplicationCreate {
  person_id: string;
  land_id?: string;

  // Land
  street_address?: string;
  rt?: string;
  rw?: string;
  ward?: string;
  subdistrict?: string;
  regency?: string;
  province?: string;

  // Certificate
  cert_number: string;
  cert_type: CertificateType;

  // Dokumen
  cert_file: File;
  ktp_penjual: File;
  kk_pembeli: File;
  ktp_pembeli: File;
  akta_jual_beli: File;
  fc_sppt: File;
  fc_pbb: File;
}

export interface ApplicationData {
  id: string;
  person_id: string;
  land_id: string;
  land_office_id: string;
  officer_id: string | null;
  status: string; // misal: "DIPROSES", "SELESAI", dsb
  type: string; // misal: "SHM"
  file_number: string;
  land_price_per_m2: number;
  registration_fee: number;
  total_fee: number; // sudah number, bukan BigInt
  notes: string | null;
  payment_tx_hash: string | null;
  paidAt: string | null; // bisa diubah ke Date jika perlu
  createdAt: string;
  updatedAt: string;
  personId: string | null;
  officer: Officer | null;
  person: Person;
  land: Land;
  landOffice: LandOffice;
  canPay: boolean;
  payment: { order_id: string; paidAt: "string" };
}

export interface Land {
  area_size: string;
}

export interface LandOffice {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  province: string;
  regency: string;
  address: string;
}

export interface ApplicationDetailResponse {
  data: ApplicationDetail;
}

interface ApplicationDetail {
  id: string;
  person_id: string;
  land_id: string;
  land_office_id: string;
  officer_id: string | null;

  status: ApplicationStatus;
  type: ApplicationType;

  nib: string;
  file_number: string;
  cert_code: string;

  land_price_per_m2: number;
  registration_fee: number;
  total_fee: number;

  notes: string | null;
  payment_tx_hash: string | null;

  paidAt: string | null;
  createdAt: string;
  updatedAt: string;

  applicationDocuments: ApplicationDocument[];

  land: Land;

  landOffice: LandOffice;

  owners: Owner[];
}

export interface ApplicationDocument {
  id: string;
  application_id: string;
  person_id: string | null;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  fileHash: string | null;
  createdAt: string;
}

export interface ApplicationPayment {
  id: string;
  order_id: string;
  expireAt: string;
  createdAt: string;
  status: PaymentStatus;
  qr_url: string;
  amount: number;
  application: {
    id: string;
    file_number: string;
  };
}

type PersonView = Pick<Person, "id" | "name" | "nik" | "email" | "phone"> & {
  marital_status: "menikah" | "belum_menikah";
  ktp_pembeli?: ApplicationDocument | File | null;
  kk_pembeli?: ApplicationDocument | File | null;
  ktp_penjual?: ApplicationDocument | File | null;
  kk_penjual?: ApplicationDocument | File | null;
  surat_nikah_penjual?: ApplicationDocument | File | null;
  surat_nikah_pembeli?: ApplicationDocument | File | null;
  npwp_pembeli?: ApplicationDocument | File | null;
  npwp_penjual?: ApplicationDocument | File | null;
};

export interface Owner {
  person: PersonView;
  share: string;
}

export type OwnerForm = Owner & {
  isSearching: boolean;
  result: Owner[];
  query: string;
  mode: "search" | "manual";
};

export interface CertificateData {
  id: string;
  nib: string;
  type: string;
  status: string;
  code: string;
  land: LandView;
}

export const fileLabels: Record<string, string> = {
  akta_jual_beli: "Akta Jual Beli",
  bphtb: "BPHTB",
  pph: "PPH",
  sppt_pbb: "SPPT PBB",
};

export const docTypeToLabel: Record<string, string> = {
  SERTIFIKAT_TANAH: "Sertifikat Tanah",
  AKTA_JUAL_BELI: "Akta Jual Beli",
  SPPT: "Fotokopi SPPT",
  PBB: "Fotokopi PBB",
  SSB: "SSB",
  KTP_PENJUAL: "KTP Penjual",
  KTP_PEMBELI: "KTP Pembeli",
  KK_PEMBELI: "KK Pembeli",
};

export const statusColor: Record<string, any> = {
  VERIFIKASI_BERKAS: "warning",
  MENUNGGU_PEMBAYARAN: "warning",
  VERIFIKASI_PEMBAYARAN: "info",
  PROSES_PENERBITAN: "primary",
  PENERBITAN_GAGAL: "primary",

  PEMBAYARAN_DIBATALKAN: "error",
  PEMBAYARAN_KADALUARSA: "error",
  PEMBAYARAN_DIKEMBALIKAN: "warning",

  DITOLAK: "error",
  TERJADI_KESALAHAN: "error",

  SELESAI: "success",
};

export const statusTextColor: Record<string, string> = {
  VERIFIKASI_BERKAS: "text-yellow-600",
  MENUNGGU_PEMBAYARAN: "text-yellow-600",
  VERIFIKASI_PEMBAYARAN: "text-blue-600",
  PROSES_PENERBITAN: "text-primary",
  PENERBITAN_GAGAL: "text-primary",
  PEMBAYARAN_DIBATALKAN: "text-red-600",
  PEMBAYARAN_KADALUARSA: "text-red-600",
  PEMBAYARAN_DIKEMBALIKAN: "text-yellow-600",
  DITOLAK: "text-red-600",
  TERJADI_KESALAHAN: "text-red-600",
  SELESAI: "text-green-600",
};

export const statusLabel: Record<string, string> = {
  VERIFIKASI_BERKAS: "Verifikasi Berkas",
  MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
  VERIFIKASI_PEMBAYARAN: "Verifikasi Pembayaran",
  PROSES_PENERBITAN: "Dalam Proses Penerbitan",
  PENERBITAN_GAGAL: "Penerbitan Gagal",

  PEMBAYARAN_DIBATALKAN: "Pembayaran Dibatalkan",
  PEMBAYARAN_KADALUARSA: "Pembayaran Kedaluwarsa",
  PEMBAYARAN_DIKEMBALIKAN: "Pembayaran Dikembalikan",

  DITOLAK: "Ditolak",
  TERJADI_KESALAHAN: "Terjadi Kesalahan",

  SELESAI: "Selesai",
};
