import {
  Component,
  ComponentRef,
  input,
  OnChanges,
  output,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { ContentDirective } from '../../directives/content';

@Component({
  selector: 'app-context',
  imports: [ContentDirective],
  templateUrl: './context.html',
  styleUrl: './context.scss',
})
export class Context<T> implements OnChanges {
  component = input.required<T>();
  content = input<unknown>();
  componentInputs = input<{ [x: string]: unknown }>();
  componentInstance = output<ComponentRef<T>>();

  private contentRef: ViewContainerRef | undefined;
  private componentRef: ComponentRef<unknown> | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    const component = changes['component']?.currentValue;

    if (!this.contentRef) return;

    if (component) this.setComponent();
  }

  buildContents(contentRef: ViewContainerRef) {
    this.contentRef = contentRef;
    this.setComponent();
  }

  setComponent() {
    if (!this.contentRef) return;

    this.contentRef.clear();
    const projectableNodes = this.getProjectableNodes();
    this.componentRef = this.contentRef.createComponent(this.component() as Type<T>, {
      projectableNodes,
    }) as ComponentRef<T>;
    this.setComponentInputs();
    this.componentInstance.emit(this.componentRef as ComponentRef<T>);
  }

  // TODO: Verify works with content projected slots
  getProjectableNodes(): Node[][] | undefined {
    const content = this.content();

    if (!content) return undefined;

    if (Array.isArray(content) && content[0] instanceof Node) return [content];

    if (content instanceof Node) return [[content]];

    const container = document.createElement('div');
    container.innerHTML = content as string;

    return [[container]];
  }

  setComponentInputs() {
    const inputs = this.componentInputs();

    if (!this.componentRef || !inputs) return;

    Object.entries(inputs).forEach((input) => {
      this.componentRef!.setInput(input[0], input[1]);
    });
  }
}
