import * as _ from 'lodash';
import { Observable } from 'rxjs';

export function getValue<T>(obs: Observable<T>): T {
  let value: T;

  obs.subscribe((res) => {
    value = res;
  });

  return _.cloneDeep(value);
}
