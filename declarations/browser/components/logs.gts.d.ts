import Component from '@glimmer/component';
import { TrackedArray } from 'tracked-built-ins';
import type Owner from '@ember/owner';
interface Log {
    level: string;
    timestamp: Date;
    message: string;
}
export declare class Logs extends Component {
    logs: TrackedArray<Log>;
    constructor(owner: Owner, args: any);
}
export {};
