import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { TemplateModel, TemplateSubmitResponse, TemplateModelResponse, TemplateItem, TemplateTriggerEvent } from 'src/app/shared/template/templatetypes.model';
import { TokenService } from 'src/app/shared/token.service';
import { user } from 'src/app/shared/auth-response';
import { CategoryService } from 'src/app/shared/template/category.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2'; 
import { TreeComponent } from '../tree/tree.component';
import { NgForm, FormGroup, FormControl, Validators } from '@angular/forms';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ActivatedRoute } from '@angular/router';
import { EventResponse, TriggerEvent } from 'src/app/shared/event/event.model';
import { QuillEditorComponent } from 'ngx-quill';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import Quill from 'quill';

import ImageResize from 'quill-image-resize-module';
import { ImageResponse } from 'src/app/shared/template/category.model';
Quill.register('modules/imageResize', ImageResize);

@Component({
  selector: 'app-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent implements OnInit, AfterViewInit {
  @ViewChild(TreeComponent) child: TreeComponent;
  @ViewChild('f', { static: false }) templateForm: NgForm;
  @ViewChild('tmpTriggerWhen') tmpTriggerWhen;
  @ViewChild('editor') editor: QuillEditorComponent;
  
  quill;
  editorText: string = '';
  templateBodyContent_q: string;
  templateBodyContent_q_alt: string;
  dynOption: string = '';
  isReadOnly: boolean = false;


  public form: FormGroup;
  
  errorMessage: string;
  
  templateId: number;
  templateTypeName: string;
  templateMessageSubject: string;
  templateBodyContent: string;

  LeadTimeIntervalArr = [{id: '1', value: 'day(s)'}, {id: '2', value: 'hour(s)'}];
  LeadTimeModeArr = [{id: '1', value: 'Prior'}, {id: '2', value: 'Later'}];


  templateLeadTimeNumber: string = '';
  templateLeadTimeInterval: string = '1';
  templateLeadTimeMode: string = '1';

  needToSchedule: boolean = false;

  public templateSelectedTrigger = [];
  templateInit: any;
  isLoading: boolean = false;

  templateSubmitResponse: TemplateSubmitResponse;
  templateModelResponse: TemplateModelResponse;
  templateItem: TemplateItem;
  tCategoryId: number; tSubcategoryId: number; tMappingId: number; tTypeNameId: number; reloadTemplateTypes: Function
  loggedUser: user;


  tempCategoryParams: any = {};
  eventResponse: EventResponse;
  events: TriggerEvent[];

  //Image response
  imageResponse: ImageResponse;

  public name = 'events';
  public allEvents = [];
  public dataEvents = [];
  public settings = {};
  public selectedItems = [
    { item_id: 3, item_text: 'Appointment is scheduled' },
    { item_id: 4, item_text: 'Reschedule Appointment' }
  ];

  placeholder_config = [
    {id:'1', display:'Patient First Name', value:'#FirstName'},
    {id:'2', display:'Patient Last Name', value:'#LastName'},
    {id:'3', display:'Appointment Datetime', value:'#ApptDatetime'},
    {id:'4', display:'Doctor Name', value:'#DoctorName'},
    {id:'5', display:'Clinic Contact', value:'#ClinicContact'},
    {id:'6', display:'Clinic Name', value:'#ClinicName'},
    {id:'7', display:'Clinic Address', value:'#ClinicAddress'},
    {id:'8', display:'Total Payment', value:'#Payamount'},
  ];


  constructor(
    private tokenService: TokenService,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    ) { 
  
  }


  ngOnInit(): void {
    this.templateInit = {
      base_url: '/tinymce',
      suffix: '.min',
      height: 400,
      //menubar: true,
      plugins: [
        'advlist autolink lists link image imagetools charmap print preview anchor',
        'searchreplace visualblocks code fullscreen',
        'insertdatetime media table paste code help wordcount placeholder noneditable'
        ],
        imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
        toolbar:
        'insertfile undo redo | placeholder | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor | removeformat | help | codeformat emoticons',
        style_formats: [
            {title: 'Bold text', inline: 'b'},
            {title: 'Red text', inline: 'span', styles: {color: '#ff0000'}},
            {title: 'Red header', block: 'h1', styles: {color: '#ff0000'}},
            {title: 'Example 1', inline: 'span', classes: 'example1'},
            {title: 'Example 2', inline: 'span', classes: 'example2'},
            {title: 'Table styles'},
            {title: 'Table row 1', selector: 'tr', classes: 'tablerow1'}
        ],
        menu: {
            custom: { title: 'Custom menu', items: 'basicitem nesteditem toggleitem' }
        },

        mobile: {
          plugins: 'print preview powerpaste casechange importcss tinydrive searchreplace autolink autosave save directionality advcode visualblocks visualchars fullscreen image link media mediaembed template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists checklist wordcount tinymcespellchecker a11ychecker textpattern noneditable help formatpainter pageembed charmap mentions quickbars linkchecker emoticons advtable'
        },
        // autosave_ask_before_unload: true,
        // autosave_interval: "30s",
        // autosave_prefix: "{path}{query}-{id}-",
        // autosave_restore_when_empty: false,
        // autosave_retention: "2m",
        image_advtab: true,
        // content_css: '//www.tiny.cloud/css/codepen.min.css',
        // link_list: [
        //   { title: 'My page 1', value: 'http://www.tinymce.com' },
        //   { title: 'My page 2', value: 'http://www.moxiecode.com' }
        // ],
         image_list: [
           { title: 'My page 1', value: 'http://www.tinymce.com' },
           { title: 'My page 2', value: 'http://www.moxiecode.com' }
         ],
         image_class_list: [
            { title: 'None', value: '' },
           { title: 'Some class', value: 'class-name' }
         ],
        // importcss_append: true,
        // templates: [
        //       { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
        //   { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
        //   { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
        // ],
        // template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
        // template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
        // image_caption: true,
        // quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        // noneditable_noneditable_class: "mceNonEditable",
        // toolbar_mode: 'sliding',
        // spellchecker_whitelist: ['Ephox', 'Moxiecode'],
        // tinycomments_mode: 'embedded',
        // content_style: ".mymention{ color: gray; }",
        contextmenu: "link image imagetools table configurepermanentpen",
        a11y_advanced_options: true,
        relative_urls : false,
        remove_script_host : false,
        convert_urls : true,

        images_upload_base_path: 'C:\\OpenDentImages\\',
          /* without images_upload_url set, Upload tab won't show up*/
        //images_upload_url: 'postAcceptor.php',

        /* we override default upload handler to simulate successful upload*/
        images_upload_handler: function (blobInfo, success, failure) {
          setTimeout(function () {
            /* no matter what you upload, we will turn it into TinyMCE logo :)*/
            success(blobInfo.filename());
          }, 2000);
        }
                
    };
    this.tempCategoryParams = {};
    this.loadEventData();
    this.dynOption = '';
  }

  populateTemplate(categoryParams: any){
    this.isLoading = true;
    this.templateSelectedTrigger = [];
    this.templateForm.resetForm({leadTimeInterval: '1', leadTimeMode: '1', leadTimeNumber: ''});
    this.tempCategoryParams = categoryParams;
    console.log('trigger populateTemplate:', categoryParams);
    // var templateParams = {catId: this.tCategoryId, subCatId: this.tSubcategoryId, mappingId: this.tMappingId };
    this.tCategoryId = categoryParams.catId === undefined ? 0 : categoryParams.catId;
    this.tSubcategoryId = categoryParams.subCatId === undefined ? 0 : categoryParams.subCatId;
    this.tMappingId = categoryParams.mappingId === undefined ?   0 : categoryParams.mappingId;
    this.tTypeNameId = categoryParams.typeNameId === undefined ? 0 : categoryParams.typeNameId;
    this.errorMessage = categoryParams.errorMessage === undefined ? '' : categoryParams.errorMessage;
    this.templateId = 0;
    //this.reloadTemplateTypes = categoryParams.cbfn;
    this.dataEvents = this.allEvents.filter(x => x.categoryId === this.tCategoryId);

    //check category to schedule timeline  - needToSchedule
    this.needToSchedule = (this.tCategoryId === 1 || this.tCategoryId === 2) ? false: true;

    if(this.tTypeNameId > 0 && this.errorMessage === ''){
      var pramObject = {templateTypeId: this.tTypeNameId};
      var result = this.categoryService.retrieveTemplate(pramObject).subscribe(response => {
        this.templateModelResponse = response;
        if(this.templateModelResponse.status === 'true'){
          this.templateItem = this.templateModelResponse.template;
          this.templateId = this.templateItem.id;
          this.templateTypeName = this.templateItem.typename;
          this.templateMessageSubject = this.templateItem.subject;
          this.templateBodyContent = this.templateItem.bodycontent;
          this.templateBodyContent_q = this.templateItem.bodycontent;
          this.templateBodyContent_q_alt = this.templateItem.bodycontent === "↵" || this.templateItem.bodycontent === "<p><br></p>" ? '' : this.templateItem.bodycontent;

          this.templateSelectedTrigger = this.templateItem.triggerEvents;
          this.templateLeadTimeNumber = this.templateItem.leadTimeNumber === null || this.templateItem.leadTimeNumber === undefined ? '' : this.templateItem.leadTimeNumber.toString();
          this.templateLeadTimeInterval = this.templateItem.leadTimeInterval === null || this.templateItem.leadTimeInterval === undefined ? '' : this.templateItem.leadTimeInterval.toString();
          this.templateLeadTimeMode = this.templateItem.leadTimeMode === null || this.templateItem.leadTimeMode === undefined ? '' : this.templateItem.leadTimeMode.toString();
          //this.templateSelectedTrigger = [
            //{ item_id: 3, item_text: 'Appointment is scheduled' },
            //{ item_id: 4, item_text: 'Reschedule Appointment' }
          //];
        }
        else{
          this.showResponseMessage(this.templateModelResponse.message, 'e');
          this.templateTypeName = '';
          this.templateMessageSubject = '';
          this.templateBodyContent = '';
          this.templateBodyContent_q = this.templateBodyContent_q_alt ='';
          this.templateLeadTimeNumber = '';
          this.templateLeadTimeInterval = '1';
          this.templateLeadTimeMode = '1';
        }
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.errorMessage = err.toString();
        this.isLoading = false;
      });
     }
     else{
      this.templateTypeName = '';
      this.templateMessageSubject = '';
      this.templateBodyContent = '';  
      this.templateBodyContent_q = this.templateBodyContent_q_alt = '';
      this.isLoading = false;     
      this.templateLeadTimeNumber = '';
      this.templateLeadTimeInterval = '1';
      this.templateLeadTimeMode = '1';
    }

  }

  submitTeamplate(f){

    
    var messageBody = '';
    this.isLoading = true;
    this.loggedUser = JSON.parse(this.tokenService.getUser('lu'));
    console.log(f);
    console.log(f.value.messageTriggerWhen);

    if(this.tSubcategoryId === 2){
      //messageBody = this.replaceAll(f.value.emailbody,'<p>','');
      messageBody = this.replaceAll(f.value.emailbody_alt,'<p>','');
      messageBody = this.replaceAll(messageBody,'</p>','');
      messageBody = this.replaceAll(messageBody,'<br>','');
      messageBody = this.replaceAll(messageBody,'<i>','');
      messageBody = this.replaceAll(messageBody,'<b>','');
      messageBody = this.replaceAll(messageBody,'<u>','');
      messageBody = this.replaceAll(messageBody,'</i>','');
      messageBody = this.replaceAll(messageBody,'</b>','');
      messageBody = this.replaceAll(messageBody,'</u>','');
    }
    else{
      messageBody = this.editorText; //f.value.emailbody_quill; //emailbody;
    }

    var startImageCount = this.getImageCount(messageBody, 'data:image');
    var endImageCount = this.getImageCount(messageBody, '">');

    var templateModel = new TemplateModel(this.tCategoryId, this.tSubcategoryId, 
                            this.tMappingId, this.tTypeNameId, this.templateId, f.value.templateName, 
                            f.value.messageSubject, messageBody, 
                            this.loggedUser.id, this.loggedUser.id, f.value.messageTriggerWhen,
                            +f.value.leadTimeNumber, +f.value.leadTimeInterval, +f.value.leadTimeMode);

    var templateInfo = {templateInfo: templateModel, startImageIndex: startImageCount, endImageIndex: endImageCount};
    var result = this.categoryService.addTemplate(templateInfo).subscribe(response => {
      this.templateSubmitResponse = response;
      if(this.templateSubmitResponse.status === 'true'){
        this.tTypeNameId = this.templateSubmitResponse.tempTypeId;
        this.showResponseMessage(this.templateSubmitResponse.result, 's');
        f.resetForm();
      }
      else{
        this.showResponseMessage(this.templateSubmitResponse.message, 'e');
      }
      
      this.child.populateTemplateTypes(this.tCategoryId, this.tMappingId, this.tTypeNameId);
    },
    (err: HttpErrorResponse) => {
      this.errorMessage = err.toString();
      this.isLoading = false;    
    });
  }

  showResponseMessage(message: string, type: string){
    var messageType = '';
    var title = type === 's' ? `Success`: `Failed`;
    if(type === 'e'){
      Swal.fire({icon:'error', title: title, text: message, confirmButtonText: 'Close'})
    }
    else{
      Swal.fire({icon:'success', title: title, text: message }); //, showCancelButton: true, cancelButtonText: 'Close'
        //  .then((result) => {
        //    if (result.value) {
        //     //this.modalService.dismissAll();
        //    }
        //    else{
        //      this.modalService.dismissAll();
        //    }
        //  });
    }
  }
  clearTemplate(f){
  }

  loadEventData(){

    this.eventResponse = this.route.snapshot.data.eventData;
    if (this.eventResponse.status === 'true') {
      this.events = this.eventResponse.events;
      this.events.forEach(element => {
        this.allEvents.push({item_id: element.id, item_text: element.name, categoryId: element.category_id});
      });
    }
    
    // this.dataEvents = [
    //   { item_id: 1, item_text: 'Add New Patient' },
    //   { item_id: 2, item_text: 'Update Patient' },
    //   { item_id: 3, item_text: 'Appointment is scheduled' },
    //   { item_id: 4, item_text: 'Reschedule Appointment' },
    //   { item_id: 5, item_text: 'Cancel Appointment' },
    //   { item_id: 6, item_text: 'Feedback when treatment is completed' }
    // ];

    // setting and support i18n
    this.settings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      enableCheckAll: true,
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      allowSearchFilter: true,
      limitSelection: -1,
      clearSearchFilter: true,
      maxHeight: 197,
      itemsShowLimit: 3,
      searchPlaceholderText: '',
      noDataAvailablePlaceholderText: '',
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false
    };

    this.setForm();
  }

  get f() { return this.form.controls; }

  public setForm() {
    this.form = new FormGroup({
      name: new FormControl(this.dataEvents, Validators.required)
    });
  }

  public onFilterChange(item: any) {
    console.log(item);
  }
  public onDropDownClose(item: any) {
    console.log(item);
  }

  public onItemSelect(item: any) {
    console.log(item);
  }
  public onDeSelect(item: any) {
    console.log(item);
  }

  public onSelectAll(items: any) {
    console.log(items);
  }
  public onDeSelectAll(items: any) {
    console.log(items);
  }

  cancelTemplate(){
    if(this.tTypeNameId > 0){
      this.populateTemplate(this.tempCategoryParams);
    }
    else if(this.tTypeNameId <= 0){
      this.templateForm.reset();    
    }
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  ngAfterViewInit(): void {
    this.templateLeadTimeMode = '1';

  } 

  moduleOptions = {
    //imageResize: true,
    imageResize: {
      modules: ["Resize", "DisplaySize", "Toolbar"]
    },
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],
  
      [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      //[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      //[{ 'direction': 'rtl' }],                         // text direction
  
      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      //[{ 'font': [] }],
      [{ 'align': [] }],
  
      ['clean'],                                         // remove formatting button
  
      ['link', 'image', 'video']                         // link and image, video
    ],
    // handlers: {
    //   image: (image) => {
    //     this.imageHandler(image);
    //   }
    // }
  };

  imageHandler(image){
    console.log('image added');

  }
  
  addBindingCreated(quill) {
    quill.keyboard.addBinding({
      key: 'b'
    }, (range, context) => {
      // tslint:disable-next-line:no-console
      console.log('KEYBINDING B', range, context)
    })

    quill.keyboard.addBinding({
      key: 'B',
      shiftKey: true
    }, (range, context) => {
      // tslint:disable-next-line:no-console
      console.log('KEYBINDING SHIFT + B', range, context)
    })
  }
  
  changedEditor(event: EditorChangeContent | EditorChangeSelection){
    console.log(`Editor got changed: ${event['editor']['root']['innerHTML']}`);
    this.editorText = this.templateBodyContent_q_alt = event['editor']['root']['innerHTML'];
  }

  changedContent(event: EditorChangeContent | EditorChangeSelection) {

    this.editorText = event['editor']['root']['innerHTML'];
    var temp_editorText = event['editor']['root']['innerHTML'];
    this.templateForm.controls['emailbody_alt'].markAsTouched();
    this.templateForm.controls['emailbody_alt'].markAsDirty();
    this.templateBodyContent_q_alt = event['editor']['root']['innerHTML'] === "↵" || event['editor']['root']['innerHTML'] === "<p><br></p>"
    ? ''
    : this.editorText;

    /*
    var dataImage = event['delta'].ops[1].insert !== undefined && event['delta'].ops[1].insert !== null ? event['delta'].ops[1].insert.image : '';

    if (dataImage.indexOf('data:image') >= 0) {
      var imageurl = this.categoryService.transformimage({imgBase64:dataImage}).subscribe(response => {
        this.imageResponse = response;
        if (this.imageResponse.status === 'true') {
          this.editorText = temp_editorText.replace(dataImage, this.imageResponse.imageUrl);
          this.templateBodyContent_q_alt = event['editor']['root']['innerHTML'] === "↵" || event['editor']['root']['innerHTML'] === "<p><br></p>"
            ? ''
            : this.editorText;
        }
      });
    }
    else {
      this.templateBodyContent_q_alt = event['editor']['root']['innerHTML'] === "↵" || event['editor']['root']['innerHTML'] === "<p><br></p>"
        ? ''
        : this.editorText;
    }
    */
  }

    
  appendText() {
    console.log(this.dynOption);
    this.templateForm.controls['emailbody_alt'].markAsTouched();
    this.templateForm.controls['emailbody_alt'].markAsDirty();
    var selectedph = this.placeholder_config.findIndex(x => x.id === this.dynOption);
    let range1 = this.editor.quillEditor.getSelection(true);
    let range = this.editor.quillEditor.getSelection(true);
    //this.editor.quillEditor.insertText(range.index, `[#${selText}] `, 'tag-name', true);
    this.editor.quillEditor.insertText(range.index, `[${this.placeholder_config[selectedph].value}] `, true);
    this.editor.quillEditor.setSelection(range.index + this.placeholder_config[selectedph].value.length + 3, Quill.sources.SILENT);
  }


  getImageCount(bodyMessage, element) {
    let indices = [];

    let idx = bodyMessage.indexOf(element);

    while (idx !== -1) {
      indices.push(idx + 1);
      idx = bodyMessage.indexOf(element, idx + 1);
    }
    return indices;
  }

}

