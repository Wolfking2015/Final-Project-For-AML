/**
 * Ensure the integrity of a package.
 *
 * @param options - The options used to ensure the package.
 *
 * @returns A list of changes that were made to ensure the package.
 */
export declare function ensurePackage(options: IEnsurePackageOptions): Promise<string[]>;
/**
 * The options used to ensure a package.
 */
export interface IEnsurePackageOptions {
    /**
     * The path to the package.
     */
    pkgPath: string;
    /**
     * The package data.
     */
    data: any;
    /**
     * The cache of dependency versions by package.
     */
    depCache?: {
        [key: string]: string;
    };
    /**
     * A list of dependencies that can be unused.
     */
    unused?: string[];
    /**
     * A list of dependencies that can be missing.
     */
    missing?: string[];
    /**
     * A map of local package names and their relative path.
     */
    locals?: {
        [key: string]: string;
    };
    /**
     * Whether to enforce that dependencies get used.  Default is true.
     */
    noUnused?: boolean;
}
