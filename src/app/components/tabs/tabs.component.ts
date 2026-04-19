import {
  AfterViewInit,
  Component,
  ComponentRef,
  ElementRef,
  inject,
  input,
  output,
  OutputEmitterRef,
  signal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { TabConfig, TabsConfig } from '../../models';
import { ContentDirective } from '../../directives/content';

@Component({
  selector: 'app-tabs',
  imports: [ContentDirective],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
})
export class TabsComponent implements AfterViewInit {
  config = input.required<TabsConfig>();
  switch = output<{ from: string | undefined; to: string }>();
  outputs = output<{ type: string; event: unknown }>();

  private elementRef = inject(ElementRef);

  protected activeTabName: string = '';
  private tabsContainer: ViewContainerRef | undefined;
  tabInstances = new Map<string, ComponentRef<unknown>>();

  tabsLoaded = signal(false);

  ngAfterViewInit(): void {
    const config = this.config();
    (this.elementRef.nativeElement as HTMLElement).classList.add(`tabs-${config.orientation}`);
  }

  /**
   * Scenario 1: Lazy-loaded & persist content
   * Load first tab only, load additional tabs when switching tabs
   *
   * Scenario 2: Lazy-loaded & not persist content
   * Load first tab only, replace when switching
   *
   * Scenario 3: Not lazy-loaded & persist content
   * Load all tabs on init, keep all tabs
   *
   * Scenario 4: Not lazy-loaded & not persist content (ignore, can only persist content when not lazy-loaded)
   * Load all tabs on init, remove when switching
   */

  protected setTabs(ref: ViewContainerRef) {
    this.tabsContainer = ref;
    const config = this.config();
    const initialTab = this.getInitialTab();

    if (!initialTab) {
      console.warn(`[Tabs => setTabs()]: No tab with matching name ${config.initialTab}.`);
      return;
    }

    this.activeTabName = initialTab.tabName;
    this.createTab(initialTab);

    if (config.lazyLoaded === false) {
      const otherTabs = config.tabs.filter((tab) => tab.tabName !== initialTab.tabName);
      otherTabs.forEach((config) => {
        const tabRef = this.createTab(config);
        const tabEl = tabRef.location.nativeElement as HTMLElement;
        tabEl.classList.add('hidden');
      });
    }

    this.tabsLoaded.set(true);
  }

  createTab(config: TabConfig) {
    const tabsContainer = this.tabsContainer as ViewContainerRef;
    const componentRef = tabsContainer.createComponent(config.component);
    const containerEl = tabsContainer.element as ElementRef<HTMLDivElement>;

    this.setTabContents(componentRef, config, containerEl);

    if (!this.tabInstances.has(config.tabName)) this.tabInstances.set(config.tabName, componentRef);

    return componentRef;
  }

  setTabContents(
    componentRef: ComponentRef<unknown>,
    tabConfig: TabConfig,
    containerEl: ElementRef<HTMLDivElement>,
  ) {
    this.setComponentInputs(componentRef, tabConfig);
    containerEl.nativeElement.appendChild((componentRef.hostView as any).rootNodes[0]);
    this.refOutputsListener(componentRef);
  }

  setComponentInputs(componentRef: ComponentRef<unknown>, tabConfig: TabConfig) {
    const inputs = tabConfig.inputs;

    if (!inputs) return;

    Object.entries(inputs).forEach((input) => {
      componentRef.setInput(input[0], input[1]);
    });
  }

  refOutputsListener(componentRef: ComponentRef<unknown>) {
    Object.entries(componentRef.instance as { [x: string]: unknown })
      .filter(([_prop, value]) => {
        return value instanceof OutputEmitterRef;
      })
      .forEach(([type, signal]) => {
        (signal as OutputEmitterRef<unknown>).subscribe((event) => {
          this.outputs.emit({ type, event });
        });
      });
  }

  getInitialTab() {
    const config = this.config();
    return config.initialTab
      ? config.tabs.find((tab) => tab.tabName === config.initialTab)
      : config.tabs[0];
  }

  toggleTabEnabled(tabName: string, enabled = true) {
    const config = this.config();
    const selectedTab = config.tabs.find((tab) => tab.tabName === tabName);
    selectedTab
      ? (selectedTab.disabled = !enabled)
      : console.warn(
          `[Tabs => toggleTabEnabled()]: No matching tab with the name ${tabName}. Cannot ${enabled ? 'Enable' : 'Disable'}.`,
        );
  }

  switchTab(tabName: string) {
    const config = this.config();
    const tabConfig = config.tabs.find((tab) => tab.tabName === tabName);
    const tabsContainer = this.tabsContainer as ViewContainerRef;

    if (!tabConfig) {
      console.warn(`[Tabs => setTab()]: Cannot find tab with name ${tabName}`);
      return;
    }

    if (config.lazyLoaded && !config.persistOnSwitch) {
      this.tabInstances.delete(this.activeTabName);
      tabsContainer.clear();
      const tabRef = this.createTab(tabConfig);
      const tabEl = tabRef.location.nativeElement as HTMLElement;
      tabEl.classList.remove('hidden');
    }

    if (config.persistOnSwitch) {
      const currentTabRef = this.tabInstances.get(this.activeTabName) as ComponentRef<unknown>;
      const currentTabEl = currentTabRef.location.nativeElement as HTMLElement;
      const tabInDOM = this.tabInstances.has(tabConfig.tabName);
      currentTabEl.classList.add('hidden');
      if (tabInDOM) {
        const newTabRef = this.tabInstances.get(tabName) as ComponentRef<unknown>;
        const newTabEl = newTabRef.location.nativeElement as HTMLElement;
        newTabEl.classList.remove('hidden');
      } else {
        this.createTab(tabConfig);
      }
    }

    if (config.lazyLoaded === false) {
      const currentTabRef = this.tabInstances.get(this.activeTabName) as ComponentRef<unknown>;
      const currentTabEl = currentTabRef.location.nativeElement as HTMLElement;
      currentTabEl.classList.add('hidden');

      const newTabRef = this.tabInstances.get(tabName) as ComponentRef<unknown>;
      const newTabEl = newTabRef.location.nativeElement as HTMLElement;
      newTabEl.classList.remove('hidden');
    }

    this.switch.emit({
      from: this.activeTabName,
      to: tabName,
    });

    this.activeTabName = tabName;
  }

  setTabInstance(tabName: string, ref: ComponentRef<Type<unknown>>) {
    this.tabInstances.set(tabName, ref);
  }
}
