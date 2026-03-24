import { Component, output } from '@angular/core';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-chip',
  imports: [Icon],
  templateUrl: './chip.html',
  styleUrl: './chip.scss',
})
export class Chip {
  delete = output<void>();
}
