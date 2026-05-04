import { computed } from '@angular/core';

function fallBack(testDimension: number): boolean {
  const html = document.documentElement;

  if (html && html.clientWidth) {
    return html.clientWidth <= testDimension;
  }

  return (window.innerWidth || document.body.clientWidth) <= testDimension;
}

const tablet = computed(() =>
  window.visualViewport ? window.visualViewport.width <= 768 : fallBack(768),
);
const mobile = computed(() =>
  window.visualViewport ? window.visualViewport.width <= 425 : fallBack(425),
);
const mobileSmall = computed(() =>
  window.visualViewport ? window.visualViewport.width <= 320 : fallBack(320),
);

export const viewportDimensions = {
  tablet,
  mobile,
  mobileSmall,
};
