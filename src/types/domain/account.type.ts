import { Gender } from "../enums";

export interface VerificationAccountCreate {
  fullName: string;
  nik: string;
  phone: string;
  birthPlace: string;
  birthDate: Date;
  gender: Gender;
  address: string;
}
