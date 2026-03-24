import { AfterViewInit, Component, ContentChild, ElementRef, inject, input } from '@angular/core';
import { IconName, iconNames } from '../../models/icons.model';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon implements AfterViewInit {
  constructor(public el: ElementRef) {}

  ngAfterViewInit(): void {
    const iconName = (this.el.nativeElement as HTMLElement).outerText as IconName;
    if (!iconNames.includes(iconName))
      return console.warn(
        `[Icon => ngAfterViewInit()] ${iconName} is not a valid IconName. Please make sure that is is in the iconNames array.`,
      );
    const stylesheetHref = this.getHref(iconName);
    const stylesheet = document.querySelector(`[href="${stylesheetHref}"]`);

    if (!stylesheet) {
      const head = document.head;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylesheetHref;
      head.appendChild(link);
    }
  }

  getHref = (iconName: IconName) =>
    `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${iconName.toLowerCase()}`;
}
