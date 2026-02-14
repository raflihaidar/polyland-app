export interface Person {
  id: string;
  name: string;
  wallet_address?: string;
  username: string;
  password: string;
  email?: string;
  nonce?: string;
  nik?: string;
  address?: string;
  phone?: string;
}

export interface PersonCreate {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
