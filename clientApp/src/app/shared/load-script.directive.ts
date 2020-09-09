import { Directive, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appLoadScript]'
})
export class LoadScriptDirective implements OnInit {
  @Input('script') param: any;
  
  constructor() { }

  ngOnInit() {
    var isFound = false;
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; ++i) {
      if (scripts[i].getAttribute('src') != null && 
      scripts[i].getAttribute('src').includes(this.param) && 
      (this.param.indexOf('app.js') <= 0 && 
      this.param.indexOf('init.js') && 
      this.param.indexOf('exconsent.js') <= 0 && 
      this.param.indexOf('apex') <= 0)
      ) {
        isFound = true;
      }
    }
    if(!isFound)
    {
      let node = document.createElement('script');
      node.src = this.param;
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      document.getElementsByTagName('head')[0].appendChild(node);
    }
  }

}
