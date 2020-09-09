import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CrownbridgeConsentComponent } from './crownbridge-consent.component';

describe('CrownbridgeConsentComponent', () => {
  let component: CrownbridgeConsentComponent;
  let fixture: ComponentFixture<CrownbridgeConsentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CrownbridgeConsentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CrownbridgeConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
