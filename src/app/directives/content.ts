import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  output,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  selector: '[content]',
})
export class ContentDirective implements AfterViewInit {
  viewContainer = output<ViewContainerRef>({ alias: 'viewContainerRef' });

  private viewContainerRef = inject(ViewContainerRef);

  ngAfterViewInit(): void {
    this.viewContainer.emit(this.viewContainerRef);
  }
}
