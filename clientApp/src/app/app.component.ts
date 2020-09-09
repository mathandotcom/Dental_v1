import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  appTitle = 'Justdental';
  constructor(private titleService: Title, private router: Router, private activatedRoute: ActivatedRoute){
    this.setTitle();
  }

  setTitle() {
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map((route: any) => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter((route) => route.outlet === 'primary'),
      mergeMap((route: any) => route.data)).subscribe((event) => {
        let pageTitle = event['title'];
        //this.titleService.setTitle(this.appTitle + '-' + pageTitle);
        this.titleService.setTitle( pageTitle);
        //console.log('Page Title', pageTitle);
      })
    }
}
