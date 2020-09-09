
export interface authResponse {
  status: boolean,
  message: string,
  user: user,
  token: string
}

export interface user{
  id: number,
  clinic_id: number;
  username: string,
  firstname: string,
  lastname: string,
  updatedon: string,
  createdon: string,
  phone: number,
  roleid : number,
  active: boolean
}

export interface error {
  type: string,
  message: string
}

export interface errors {
  errors: Array<error>
}


