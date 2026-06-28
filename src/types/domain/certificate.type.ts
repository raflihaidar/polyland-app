import { type CertificateType, type CertificateStatus } from "@/types";

export type CertificateAddress = {
  province: string;
  regency: string;
  district: string;
  village: string;
  rt: string;
  rw: string;
};

export interface Certificate {
  id: string;
  owners: string[];
  label: string;
  nib: string;
  type: CertificateType;
  status: CertificateStatus;
  person_id: string;
  area_size: string;
  address: CertificateAddress;
}

export type CertificateParams = {
  page: number;
  limit: number;
  search: string;
  status: CertificateStatus | null;
  type: CertificateType | null | string;
  sortOrder: "asc" | "desc";
  sortBy: "createdAt" | "label";
};

export interface CertificateDetail {
  id: string;
  code: string;
  label: string | null;
  nib: string;
  type: CertificateType;
  status: string;
  createdAt: string;
  cid: string | null;
  owners: CertificateOwnership[];
  address: CertificateAddress;
}

export interface CertificateOwnership {
  name: string;
  ownership: string;
}
