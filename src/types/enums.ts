export enum Gender {
  lakiLaki = "LAKI_LAKI",
  perempuan = "PEREMPUAN",
}

export const CertificateType = {
  SHM: "SHM",
  SHGB: "SHGB",
  SHGU: "SHGU",
} as const;

export type CertificateType =
  (typeof CertificateType)[keyof typeof CertificateType];

export type ApplicationType = "SHM" | "HGB" | "AJB";

export type CertificateStatus =
  | "AKTIF"
  | "TIDAK_AKTIF"
  | "DALAM_PROSES"
  | "BERMASALAH";

export type ApplicationStatus =
  | "DIPROSES"
  | "VERIFIKASI_BERKAS"
  | "MENUNGGU_PEMBAYARAN"
  | "DITOLAK"
  | "SELESAI";

export const DocumentType = {
  KTP_PEMBELI: "KTP_PEMBELI",
  KTP_PENJUAL: "KTP_PENJUAL",
  KK_PEMBELI: "KK_PEMBELI",
  AKTA_JUAL_BELI: "AKTA_JUAL_BELI",
  PBB: "PBB",
  SPPT: "SPPT",
  SERTIFIKAT_TANAH: "SERTIFIKAT_TANAH",
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];
