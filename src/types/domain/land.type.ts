export interface Region {
  name: string;
}

export interface LandView {
  id: string;
  area_size: string;
  street_address: string;
  rt: string;
  rw: string;
  province: Region;
  regency: Region;
  district: Region;
  village: Region;
}
