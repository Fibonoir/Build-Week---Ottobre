import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameboardComponent } from './gameboard.component';

describe('GameBoardComponent', () => {
  let component: GameboardComponent;
  let fixture: ComponentFixture<GameboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
