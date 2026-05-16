import type {
  CertificateType,
  DocumentType,
  ApplicationStatus,
  ApplicationType,
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
}

export interface Land {
  area_size: string;
}

export interface LandOffice {
  name: string;
  code: string;
  address: string;
  email: string;
  phone: string;
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

type PersonView = Pick<Person, "id" | "name" | "nik" | "email" | "phone"> & {
  ktp_pembeli: ApplicationDocument | File | null;
  kk_pembeli: ApplicationDocument | File | null;
};

export interface Owner {
  person: PersonView;
  share: string;
}

export interface CertificateData {
  id: string;
  nib: string;
  type: string;
  status: string;
  code: string;
  land: LandView;
}
