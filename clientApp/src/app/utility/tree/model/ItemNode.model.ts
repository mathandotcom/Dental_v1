export class ItemNode {
    id: number;
    category_id: number;
    mapping_id: number;
    name: string;
    type: string;
    children: ItemNode[];
  
    constructor(id, category_id, mapping_id, name, type) {
      this.id = id;
      this.category_id = category_id;
      this.mapping_id = mapping_id;
      this.name = name;
      this.type = type;
    }
  }