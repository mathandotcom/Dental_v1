import {Injectable} from '@angular/core';
import {ItemNode} from '../model/ItemNode.model';
import {DATA} from '../data/data.mock';
import {BehaviorSubject} from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { CategoryResponse } from 'src/app/shared/template/category.model';
/**
 * This class transforms a data array into structured tree
 */

@Injectable()
export class TreeBuilder {
   dataChange = new BehaviorSubject<ItemNode[]>([]);
   categoryResponse: CategoryResponse;
  get data(): ItemNode[] { return this.dataChange.value; }
  
  constructor(
    private route: ActivatedRoute,

  ) {
    this.initialize();
  }

  initialize() {
    console.log(DATA)
    //const data = this.builTree(DATA, 0);
    this.categoryResponse = this.route.snapshot.data.categoryData;
    const data = this.builTree(this.categoryResponse.category, 0);
    this.dataChange.next(data);
  }

  builTree(obj: any, level: number): ItemNode[] {
    return Object.keys(obj).reduce<ItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = value.type==='file' ?  new ItemNode(value.id, value.category_id, value.mapping_id, value.name, value.type) : new ItemNode(value.id, value.id, 0, value.name, value.type);
      console.log(value)
      if (value != null) {
        if (typeof value === 'object') {
          if (value.children !== undefined) {
            node.children = this.builTree(value.children, level + 1);
          }
       
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}