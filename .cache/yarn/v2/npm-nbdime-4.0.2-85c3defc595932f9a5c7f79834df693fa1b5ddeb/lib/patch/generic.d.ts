import { JSONValue, JSONArray, JSONObject } from '@phosphor/coreutils';
import { IDiffEntry } from '../diff/diffentries';
/**
 * Patch a base JSON object according to diff. Returns the patched object.
 */
export declare function patch(base: string, diff: IDiffEntry[] | null): string;
export declare function patch<T extends JSONArray>(base: T, diff: IDiffEntry[] | null): T;
export declare function patch<T extends JSONObject>(base: T, diff: IDiffEntry[] | null): T;
export declare function patch(base: JSONValue, diff: IDiffEntry[] | null): JSONValue;
//# sourceMappingURL=generic.d.ts.map