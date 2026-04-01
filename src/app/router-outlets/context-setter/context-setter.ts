import { Component, inject, OnInit } from '@angular/core';
import { Context } from '../../components/context/context';
import { Chip } from '../../components/chip/chip';
import { Icon } from '../../components/icon/icon';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

const components = [Chip, Icon] as const;
type ComponentType = (typeof components)[number];

@Component({
  selector: 'app-context-setter',
  imports: [CommonModule, Context, Icon],
  templateUrl: './context-setter.html',
  styleUrl: './context-setter.scss',
})
export class ContextSetter implements OnInit {
  protected componentStrings = ['chip', 'icon'] as const;
  protected currentContext: ComponentType | undefined;
  protected stringContext: string | undefined;
  protected projectedContent: unknown;

  protected router = inject(Router);

  ngOnInit(): void {
    this.setInstance('chip');
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

  setOutputs(instance$: unknown) {
    const instance = instance$ as ComponentType;

    if (instance instanceof Chip) {
      (instance as Chip).delete.subscribe(() => {
        alert('Chip removed!');
      });
    }
  }
}
