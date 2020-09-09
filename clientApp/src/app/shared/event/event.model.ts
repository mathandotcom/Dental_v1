export interface EventResponse{
    status: string,
    message: string,
    events: TriggerEvent[];
}

export interface TriggerEvent{
    id: number,
    name: string,
    category_id: number
}