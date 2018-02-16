import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AppComponent } from './app.component';
import { MultiChipsComponent } from './multi-chip/multi-chip.component';
import { ChipComponent } from './chip/chip.component';
import { InfiniteScrollerDirective } from './infinitescroll.directive';

@NgModule({
  declarations: [
    AppComponent,
    MultiChipsComponent,
    ChipComponent,
    InfiniteScrollerDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
