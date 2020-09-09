export interface UserResponse{
    status: string,
    message: string,
    users: UserModel[]

}

export interface UserModel {
    id: number,
    clinic_id: number,
    username: string,
   
    firstname: string,
    lastname: string,
    phone: string,
    roleid: number,
    createdon: string,
    updatedon: string,
    updatedby: number,
    clinic_name: string,
    groupof: string,
    address1: string,
    address2: string,
    city: string,
    state: string,
    zip: string,
    primary_contact: string,
    primary_phone: string,
    secondary_phone: string,
    primary_email: string
}