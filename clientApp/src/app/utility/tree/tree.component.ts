import { Component, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl } from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import {TreeBuilder} from './utils/tree-builder';
import {ItemNode} from './model/ItemNode.model';
import {ItemFlatNode} from './model/ItemFlatNode.model';
import {BehaviorSubject, Observable, of as observableOf} from 'rxjs';
import { CategoryService } from 'src/app/shared/template/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TemplateTypeResponse, TemplateTypes } from 'src/app/shared/template/templatetypes.model';


@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
  providers: [TreeBuilder]
})
export class TreeComponent implements OnInit, AfterViewInit {
//https://stackblitz.com/edit/material-tree?file=src%2Fapp%2Fapp.component.html
//https://stackblitz.com/edit/angular-material-tree-example?file=src%2Findex.html
  @Output() selectTemplate = new EventEmitter();

  activeNode: any;
  expandedNode: number = 0;
  treeControl: FlatTreeControl<ItemFlatNode>;
  treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;
  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;
 /** The selection for checklist */
  checklistSelection = new SelectionModel<ItemFlatNode>(true /* multiple */);
   /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<ItemFlatNode, ItemNode>();
  templateTypeResponse: TemplateTypeResponse;
  templateTypes: TemplateTypes[];
  selectedTemplateType: TemplateTypes;
  tCategoryId: number;
  tSubcategoryId: number;
  tMappingId: number;
  tTempateTypeId: number;
  errorMessage: string;


  constructor(
    private database: TreeBuilder,
    private categoryService: CategoryService
    ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this._getLevel,
      this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    database.dataChange.subscribe(data => this.dataSource.data = data);
    if(this.treeControl.dataNodes.length <= 0) return;
    this.treeControl.expand(this.treeControl.dataNodes[0]);
    this.selectNode(this.treeControl.dataNodes[1]);

  }

  ngOnInit(): void {
  }

  transformer = (node: ItemNode, level: number) => {
    return new ItemFlatNode(!!node.children, node.id, node.category_id, node.mapping_id, node.name, node.type, level);
  }

  private _getLevel = (node: ItemFlatNode) => node.level;

  private _isExpandable = (node: ItemFlatNode) => node.expandable;

  private _getChildren = (node: ItemNode): Observable<ItemNode[]> => observableOf(node.children);

  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    console.log(this.checklistSelection)
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: ItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  selectNode(node){
    console.log(node);
    this.activeNode = node;
    this.tCategoryId = node.category_id;

    if(node.expandable === true && node.type === 'folder'){
      this.tSubcategoryId = 0;this.tMappingId = 0;

      if(this.treeControl.isExpanded(node)){
        this.treeControl.collapse(node);
      }
      else{
        let selectedNode = this.treeControl.dataNodes.findIndex(x => x.id === node.id && x.expandable === node.expandable );
        this.treeControl.expand(this.treeControl.dataNodes[selectedNode]);
      }

      // this.treeControl.collapseAll();

      // let selectedNode = this.treeControl.dataNodes.findIndex(x => x.id === node.id);

      // if(this.expandedNode !== selectedNode){
      //   this.treeControl.expand(this.treeControl.dataNodes[selectedNode]);
      //   this.expandedNode = selectedNode;
      // }
      // else{
      //   this.expandedNode = -1;
      // }
    }
    else{
      this.tSubcategoryId = node.id;
      this.tMappingId = node.mapping_id;
    }
    this.populateTemplateTypes(node.category_id, node.mapping_id, 0);
    
  }

  populateTemplateTypes(categoryId: number, mappingId: number, templateTypeId: number){
    this.templateTypes = [];this.tTempateTypeId = templateTypeId > 0 ? templateTypeId : 0;
    this.errorMessage = '';
    var paramObject = {categoryId: categoryId, mappingId: mappingId};
    var templateType = this.categoryService.getTemplateTypes(paramObject).subscribe(response => {
      this.templateTypeResponse = response;
      if(this.templateTypeResponse.status === 'true'){
        this.templateTypes = this.templateTypeResponse.typenames;
        var findIndex = templateTypeId > 0 ? this.templateTypes.findIndex(x => x.id === this.tTempateTypeId) : 0;
        this.getTemplate(this.templateTypes[findIndex]); //.filter(x => x.id === this.tTempateTypeId)
      }
      else{
        this.errorMessage = this.templateTypeResponse.message;
      }
      if(this.errorMessage !== ''){
          var templateParams = {catId: categoryId, subCatId: this.tSubcategoryId, mappingId: mappingId, typeNameId: this.tTempateTypeId, cbfn: this.reloadTemplateTypes, errorMessage: this.errorMessage};
          this.selectTemplate.emit(templateParams);
      }
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
    });

  }

  addTemplate() {
    if(this.tSubcategoryId <= 0){
      this.errorMessage = "Please select template category";
      return;
    }
    this.selectedTemplateType = undefined;
    var templateParams = {catId: this.tCategoryId, subCatId: this.tSubcategoryId, mappingId: this.tMappingId, typeNameId: 0, cbfn: this.reloadTemplateTypes, errorMessage: ''};
    console.log(`selected category ${JSON.stringify(templateParams)}`);
    this.selectTemplate.emit(templateParams);
  }

  getTemplate(templateType) {
    this.selectedTemplateType = templateType;
    if(this.tSubcategoryId <= 0 && templateType.category_id <= 0){
      this.errorMessage = "Please select template category";
      return;
    }
    this.tMappingId = templateType.categorymapping_id;
    this.tTempateTypeId = templateType.id;
    var templateParams = {catId: this.tCategoryId, subCatId: this.tSubcategoryId, mappingId: this.tMappingId, typeNameId: this.tTempateTypeId, cbfn: this.reloadTemplateTypes, errorMessage: ''};
    console.log(`selected category ${JSON.stringify(templateParams)}`);
    this.selectTemplate.emit(templateParams);
  }

  reloadTemplateTypes(){
    console.log('callback');
    this.populateTemplateTypes(this.tCategoryId, this.tMappingId, 0);
  }

  ngAfterViewInit(): void {
  }

  doSomething() {
    console.log('do something');
  }

}
