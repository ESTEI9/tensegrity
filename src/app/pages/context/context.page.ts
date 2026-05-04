import {
  AfterViewInit,
  Component,
  ComponentRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Context } from '../../components/context/context';
import { Chip } from '../../components/chip/chip';
import { Icon } from '../../components/icon/icon';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';

const components = [Chip, Icon] as const;
type ComponentType = (typeof components)[number];

@Component({
  selector: 'app-context-page',
  imports: [CommonModule, Context],
  templateUrl: './context.page.html',
  styleUrl: './context.page.scss',
})
export class ContextPage implements OnInit, AfterViewInit {
  @ViewChild('documentation') documentation: TemplateRef<unknown> | undefined;
  @ViewChild('configuration') configuration: TemplateRef<unknown> | undefined;
  @ViewChild('output') output: TemplateRef<unknown> | undefined;

  protected componentStrings = ['chip', 'icon'] as const;
  protected currentContext: ComponentType | undefined;
  protected stringContext: string | undefined;
  protected projectedContent: Node | Node[] | string | undefined;

  afterViewInitHook = new Subject<void>();

  ngOnInit(): void {
    this.setInstance('chip');
  }

  ngAfterViewInit(): void {
    this.afterViewInitHook.next();
  }

  setInstance(key: string) {
    this.stringContext = key;
    [this.currentContext, this.projectedContent] = (() => {
      switch (key) {
        case 'chip': {
          const div = document.createElement('div');
          div.innerHTML = 'Chip Content';
          return [Chip, div];
        }
        case 'icon': {
          const span = document.createElement('span');
          span.innerText = 'token';
          return [Icon, span];
        }
        default:
          return new Array(2);
      }
    })();
  }

  setOutputs(ref: ComponentRef<unknown>) {
    const instance = ref.instance as ComponentType;

    if (instance instanceof Chip) {
      (instance as Chip).delete.subscribe(() => {
        alert('Chip removed!');
      });
    }
  }
}
