import { AfterViewInit, Component, ElementRef } from '@angular/core';
import { IconName, iconNames } from '../../models/icons.model';

@Component({
  selector: 'app-icon',
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
})
export class Icon implements AfterViewInit {
  constructor(public el: ElementRef) {}
  stylesheetHref =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=';

  ngAfterViewInit(): void {
    const iconName = (this.el.nativeElement as HTMLElement).outerText as IconName;
    if (!iconNames.includes(iconName))
      return console.warn(
        `[Icon => ngAfterViewInit()] ${iconName} is not a valid IconName. Please make sure that is is in the iconNames array.`,
      );
    const stylesheetHref = this.stylesheetHref + iconName;
    const stylesheet = document.querySelector(
      `[href^="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"]`,
    );

    if (!stylesheet) {
      const head = document.head;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylesheetHref;
      head.appendChild(link);
    } else {
      const currentUrl = stylesheet.getAttribute('href');
      const iconNames = currentUrl!.split('&icon_names=')![1].split(',');

      if (iconNames.includes(iconName)) return;

      iconNames.push(iconName);
      iconNames.sort();

      const newIconNamesString = iconNames.join(',');

      stylesheet.setAttribute('href', this.stylesheetHref + newIconNamesString);
    }
  }
}
