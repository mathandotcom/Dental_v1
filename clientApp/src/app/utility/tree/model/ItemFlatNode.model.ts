export class ItemFlatNode {
    constructor(
       public expandable: boolean,
       //public iscollapsed: boolean,
       public id: number,
       public category_id: number,
       public mapping_id: number,
       public name: string,
       public type: string,
       public level: number) {}
 }