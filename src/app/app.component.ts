import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DrawerService } from './services/drawer.service';

@Component({
  imports: [RouterModule, ButtonModule, ToastModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'devo';

  constructor(
    private viewContainerRef: ViewContainerRef,
    private drawerService: DrawerService,
  ) {}

  ngOnInit() {
    this.drawerService.setViewContainerRef(this.viewContainerRef);
  }
}
