import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DrawerService } from './services/drawer.service';
import { TimeTrackingStore } from './features/time-tracking/time-tracking.store';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  imports: [
    RouterModule,
    ButtonModule,
    ToastModule,
    BlockUIModule,
    ProgressSpinnerModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  isLoading$ = this.timeTrackingStore.isLoading$;
  isLoading: boolean = false;

  constructor(
    private timeTrackingStore: TimeTrackingStore,
    private viewContainerRef: ViewContainerRef,
    private drawerService: DrawerService,
  ) {}

  ngOnInit() {
    this.drawerService.setViewContainerRef(this.viewContainerRef);

    this.isLoading$.subscribe((value) => (this.isLoading = value));
  }
}
