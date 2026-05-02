import type { CertificateType, CertificateStatus } from "@/types";

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
  nib: string;
  type: CertificateType;
  status: CertificateStatus;
  person_id: string;
  address: CertificateAddress;
}
