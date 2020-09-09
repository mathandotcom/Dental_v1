import { Component, OnInit } from '@angular/core';
import { TokenService } from 'src/app/shared/token.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent implements OnInit {

  constructor(private tokenService: TokenService, private router: Router) { }

  ngOnInit(): void {
  }

  logout(){
    this.tokenService.clearToken();
    this.router.navigate(['./login']);
  }

}
