import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailverificationPage } from './emailverification.page';
import { describe, it, expect, beforeEach, vi } from 'vitest';
describe('EmailverificationPage', () => {
  let component: EmailverificationPage;
  let fixture: ComponentFixture<EmailverificationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailverificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
