export type Assignment = {
    id:string
    title:string
    description:string
    category:string
    status: 'new' | 'doing' | 'done'
    assigneeId?:string
    timestamp:number
}

export type Member = {
    id:string
    name:string
    category: 'ux' | 'front' | 'back'
}