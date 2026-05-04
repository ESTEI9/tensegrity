import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { TabsComponent } from '../../components/tabs/tabs.component';
import { Control, SelectControl, TabConfig, TabsConfig } from '../../models';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Select, Textbox } from '../../components/form-components';

@Component({
  template: `This is some static content`,
})
class Content1 {}

@Component({
  template: `{{ body() | async }}`,
  imports: [AsyncPipe],
})
class Content2 {
  // I understand why this works, but it seems odd; like it's a bad practice...
  body = input<BehaviorSubject<string>>();
}

@Component({
  template: `<button class="primary" (click)="clickOutput.emit()">Click me!</button>`,
})
class Content3 {
  clickOutput = output<void>();
}

@Component({
  selector: 'app-tabs-page',
  imports: [TabsComponent, FormsModule, Textbox, ReactiveFormsModule, Select],
  templateUrl: './tabs.page.html',
  styleUrl: './tabs.page.scss',
  providers: [FormGroupDirective],
})
export class TabsPage implements AfterViewInit {
  @ViewChild('documentation') documentation: TemplateRef<unknown> | undefined;
  @ViewChild('configuration') configuration: TemplateRef<unknown> | undefined;
  @ViewChild('output') output: TemplateRef<unknown> | undefined;

  afterViewInitHook = new Subject<void>();

  protected router = inject(Router);

  tab2Content = new BehaviorSubject<string>('This is some dynamic content');
  tab2Data: string | undefined;

  protected tabsConfig: TabsConfig | undefined;
  protected activeTab = 'Tab 2';

  tab2InputControl = new Control({
    name: 'tab2content',
    label: 'New Tab 2 Content',
  });

  initialTabControl = new SelectControl({
    name: 'initialTab',
    label: 'Initial Tab',
    initialValue: { value: 'Tab 1' },
    options: [{ value: 'Tab 1' }, { value: 'Tab 2' }, { value: 'Tab 3' }],
  });

  tabsConfigForm = new FormGroup({
    persistOnSwitch: new FormControl<boolean>(false),
    lazyLoaded: new FormControl<boolean>(true),
    initialTab: new FormControl<string>('Tab 1'),
  });

  private cd = inject(ChangeDetectorRef);

  ngAfterViewInit(): void {
    this.afterViewInitHook.next();
  }

  updateTab2() {
    this.tab2Content.next(this.tab2Data ?? '');
    this.tab2Data = undefined;
  }

  handleOutputs(event: { type: string; event: unknown }) {
    if (event.type === 'clickOutput') {
      window.alert('Button clicked within tab, but handled by parent!');
    }
  }

  loadTabs() {
    this.tabsConfig = undefined;
    const formValue = this.tabsConfigForm.value;
    setTimeout(() => {
      this.tabsConfig = new TabsConfig({
        persistOnSwitch: !!formValue.persistOnSwitch,
        lazyLoaded: !!formValue.lazyLoaded,
        initialTab: this.activeTab,
        tabs: [
          new TabConfig({
            tabName: 'Tab 1',
            component: Content1,
          }),
          new TabConfig({
            tabName: 'Tab 2',
            component: Content2,
            inputs: {
              body: this.tab2Content,
            },
          }),
          new TabConfig({
            tabName: 'Tab 3',
            component: Content3,
          }),
        ],
      });
      this.cd.detectChanges();
    });
  }

  setActiveTab(tabName: unknown) {
    this.activeTab = String(tabName);
  }
}
