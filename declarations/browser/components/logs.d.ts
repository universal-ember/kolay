import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
interface Log {
    level: string;
    timestamp: Date;
    message: string;
}
export declare class Logs extends Component {
    logs: TrackedArray<Log>;
    constructor(...args: ConstructorParameters<typeof Component>);
}
export {};
//# sourceMappingURL=logs.d.ts.map