import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ComponentRef,
  inject,
  TemplateRef,
  Type,
  ViewChild,
} from '@angular/core';
import { Context, TabsComponent } from '../../components';
import { FormPage } from '../form/form.page';
import { ContextPage } from '../context/context.page';
import { ModalPage } from '../modal/modal.page';
import { TabsPage } from '../tabs/tabs.page';
import { TabsConfig } from '../../models';
import { BehaviorSubject, Subject, take } from 'rxjs';
import { TemplateComponent } from '../../components/template/template.component';

@Component({
  template: `
    <h3>Definition</h3>
    <p>
      <code
        >A structural principle using compressed components (which do not touch each other) inside a
        network of continuous tension.</code
      >
    </p>
    <p class="small">
      (I feel like this name is somehow connected with my engineering here. I'll figure it out.)
    </p>
  `,
  styles: `
    :host {
      margin: 0 1rem;
      text-align: center;
      display: block;

      .small {
        font-style: italic;
        font-size: small;
        margin-top: 5rem;
      }
    }
  `,
})
class StartPage {}

@Component({
  template: `
    <div class="placeholder">
      <h1>404</h1>
      The page you are looking for can't be found.
    </div>
  `,
})
class NotFoundPage {}

@Component({
  selector: 'app-home-page',
  imports: [NgOptimizedImage, Context, TabsComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  protected cd = inject(ChangeDetectorRef);

  @ViewChild('tabs') tabsComponent: TabsComponent | undefined;

  protected stringRoute = 'startPage';
  protected loadingRoute = false;
  protected title: string | undefined;
  protected documentation = new BehaviorSubject<TemplateRef<unknown> | undefined>(undefined);
  protected configuration = new BehaviorSubject<TemplateRef<unknown> | undefined>(undefined);
  protected output = new BehaviorSubject<TemplateRef<unknown> | undefined>(undefined);
  protected consoleOutput = new BehaviorSubject<TemplateRef<unknown> | undefined>(undefined);
  protected currentRoute = StartPage;

  //mobile only
  protected navigationIsOpen = false;

  protected tabsConfig = new TabsConfig({
    lazyLoaded: false,
    initialTab: 'Description',
    tabs: [
      {
        tabName: 'Description',
        component: TemplateComponent,
        inputs: {
          templateRef: this.documentation,
        },
      },
      {
        tabName: 'Configuration',
        component: TemplateComponent,
        inputs: {
          templateRef: this.configuration,
        },
      },
      {
        tabName: 'Output',
        component: TemplateComponent,
        inputs: {
          templateRef: this.output,
        },
      },
      {
        tabName: 'Console',
        component: TemplateComponent,
        inputs: {
          templateRef: this.consoleOutput,
        },
      },
    ],
  });

  public navigate(route: string) {
    this.loadingRoute = true;
    this.stringRoute = route;
    const [currentRoute, title] = (() => {
      switch (route) {
        case 'startPage':
          return [StartPage, undefined];
        case 'form':
          return [FormPage, 'Form'];
        case 'context':
          return [ContextPage, 'Context'];
        case 'modal':
          return [ModalPage, 'Modal'];
        case 'tabs':
          return [TabsPage, 'Tabs'];
        default:
          return [NotFoundPage, undefined];
      }
    })();

    this.currentRoute = currentRoute;
    this.tabsComponent!.switchTab('Description');
    this.title = title;
    this.navigationIsOpen = false;
  }

  handleTabOutputs(event: { type: string; event: unknown }) {
    if (event.type === 'compRefOutput') {
      this.setTabs(event.event as ComponentRef<Type<unknown>>);
    }
  }

  setTabs(ref: ComponentRef<Type<unknown>>) {
    const instance = ref.instance as unknown as { [x: string]: unknown };
    const afterViewInitHook = instance['afterViewInitHook'] as Subject<void>;

    if (!afterViewInitHook) return;

    // form generator and tabs route complete. Retrofit others, then focus on styles. There's something about running 'Query' with ngtemplate. Perhaps don't need viewchild for it? Can query for it here?

    afterViewInitHook.pipe(take(1)).subscribe(() => {
      [
        ['documentation', 'Description'],
        ['configuration', 'Configuration'],
        ['output', 'Output'],
        ['consoleOutput', 'Console'],
      ].forEach(([template, tabName]) => {
        const ref = instance[template] as TemplateRef<unknown> | undefined;

        if (ref) {
          switch (template) {
            case 'documentation':
              this.documentation.next(ref);
              break;
            case 'configuration':
              this.configuration.next(ref);
              break;
            case 'output':
              this.output.next(ref);
              break;
            default:
              this.consoleOutput.next(ref);
          }
          this.tabsComponent!.enableTab(tabName);
        } else {
          this.tabsComponent!.disableTab(tabName);
        }
      });

      this.cd.detectChanges();
    });

    this.loadingRoute = false;

    this.cd.detectChanges();
  }
}
