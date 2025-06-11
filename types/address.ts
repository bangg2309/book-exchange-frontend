export type AddressType = {
  id: number;
  userId?: number;
  fullName: string;
  phoneNumber: string;
  addressDetail: string;
  ward: string;
  district: string;
  province: string;
  defaultAddress: boolean;
}

export interface Province {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
}

export interface District {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

export interface Ward {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  district_code: number;
}

export interface NewAddressForm {
  fullName: string;
  phone: string;
  address: string;
  defaultAddress: boolean;
}

export interface LocationState {
  provinces: Province[];
  districts: District[];
  wards: Ward[];
  selectedProvince: number | null;
  selectedDistrict: number | null;
  selectedWard: number | null;
  loading: {
    provinces: boolean;
    districts: boolean;
    wards: boolean;
  }
}