import { Type } from '@angular/core';

export class TabsConfig {
  tabs!: TabConfig[];
  /**
   * Whether tabs are lazy loaded
   */
  lazyLoaded? = true;
  /**
   * String matching the tabName
   */
  initialTab?: string;
  /**
   * Tabs orientation relative to the content
   * @default 'above'
   */
  orientation?: 'above' | 'below' | 'before' | 'after' = 'above';
  /**
   * Whether tabs are kept in the DOM when switching
   */
  persistOnSwitch? = true;

  constructor(config: TabsConfig) {
    Object.assign(this, config);
  }
}

export class TabConfig {
  component!: Type<unknown>;
  /** Unique Identifier to the tab */
  tabName!: string;
  disabled? = false;
  /**
   * Maps to signals in the component { name: signal name, value: signal value }
   */
  inputs?: { [x: string]: unknown };

  constructor(config: TabConfig) {
    Object.assign(this, config);
  }
}
