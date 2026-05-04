import {
  Component,
  ComponentRef,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  SimpleChanges,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { ContentDirective } from '../../directives/content';
import { BehaviorSubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-context',
  imports: [ContentDirective],
  templateUrl: './context.html',
  styleUrl: './context.scss',
})
export class Context<T> implements OnChanges, OnInit {
  component = input.required<T | BehaviorSubject<T>>();
  /** any projectable content for ng-content */
  content = input<Node | Node[] | string>();
  componentInputs = input<{ [x: string]: unknown }>();
  compRefOutput = output<ComponentRef<Type<T>>>({ alias: 'componentRef' });

  private destroyRef = inject(DestroyRef);

  private contentRef: ViewContainerRef | undefined;
  private componentRef: ComponentRef<unknown> | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    const component = changes['component']?.currentValue;

    if (!this.contentRef) return;

    if (component) this.setComponent();
  }

  ngOnInit(): void {
    const component = this.component();

    if (component instanceof BehaviorSubject) {
      component.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.setComponent());
    }
  }

  buildContents(contentRef: ViewContainerRef) {
    this.contentRef = contentRef;
    this.setComponent();
  }

  setComponent() {
    if (!this.contentRef) return;

    this.contentRef.clear();
    const projectableNodes = this.getProjectableNodes();
    const component =
      this.component() instanceof BehaviorSubject
        ? (this.component() as BehaviorSubject<Type<T>>).value
        : (this.component() as Type<T>); // behaviorsubject for handling dynamic tab config
    this.componentRef = this.contentRef.createComponent(component, {
      projectableNodes,
    }) as ComponentRef<T>;
    this.setComponentInputs();
    this.compRefOutput.emit(this.componentRef as ComponentRef<Type<T>>);
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
