/** Function type for diffing a file's revisions */
export declare type IDiffCallback = (filename: string, revisionA: string, revisionB: string) => void;
/** Interface for GitAllHistory request result,
 * has all repo information
 */
export interface IGitAllHistory {
    code: number;
    data?: {
        show_top_level?: IGitShowTopLevelResult;
        branch?: IGitBranchResult;
        log?: IGitLogResult;
        status?: IGitStatusResult;
    };
}
/** Interface for GitShowTopLevel request result,
 * has the git root directory inside a repository
 */
export interface IGitShowTopLevelResult {
    code: number;
    top_repo_path?: string;
}
/** Interface for GitShowPrefix request result,
 * has the prefix path of a directory in a repository,
 * with respect to the root directory.
 */
export interface IGitShowPrefixResult {
    code: number;
    under_repo_path?: string;
}
/** Interface for GitShowPrefix request result,
 * has the prefix path of a directory in a repository,
 * with respect to the root directory.
 */
export interface IGitCheckoutResult {
    code: number;
    message?: string;
}
/** Interface for GitBranch request result,
 * has the result of changing the current working branch
 */
export interface IGitBranchResult {
    code: number;
    branches?: Array<{
        is_current_branch: boolean;
        is_remote_branch: boolean;
        name: string;
        upstream: string;
        top_commit: string;
        tag: string;
    }>;
}
/** Interface for GitStatus request result,
 * has the status of each changed file
 */
export interface IGitStatusFileResult {
    x: string;
    y: string;
    to: string;
    from: string;
}
/** Interface for GitStatus request result,
 * has the status of the entire repo
 */
export interface IGitStatusResult {
    code: number;
    files?: [IGitStatusFileResult];
}
/** Interface for GitLog request result,
 * has the info of a single past commit
 */
export interface ISingleCommitInfo {
    commit: string;
    author: string;
    date: string;
    commit_msg: string;
    pre_commit: string;
}
/** Interface for GitCommit request result,
 * has the info of a committed file
 */
export interface ICommitModifiedFile {
    modified_file_path: string;
    modified_file_name: string;
    insertion: string;
    deletion: string;
}
/** Interface for GitDetailedLog request result,
 * has the detailed info of a single past commit
 */
export interface ISingleCommitFilePathInfo {
    code: number;
    modified_file_note?: string;
    modified_files_count?: string;
    number_of_insertions?: string;
    number_of_deletions?: string;
    modified_files?: [ICommitModifiedFile];
}
/** Interface for GitLog request result,
 * has the info of all past commits
 */
export interface IGitLogResult {
    code: number;
    commits?: [ISingleCommitInfo];
}
/**
 * Structure for the result of the Git Clone API.
 */
export interface IGitCloneResult {
    code: number;
    message?: string;
}
/**
 * Structure for the result of the Git Push & Pull API.
 */
export interface IGitPushPullResult {
    code: number;
    message?: string;
}
/** Parent class for all API requests */
export declare class Git {
    constructor();
    /** Make request for the Git Pull API. */
    pull(path: string): Promise<IGitPushPullResult>;
    /** Make request for the Git Push API. */
    push(path: string): Promise<IGitPushPullResult>;
    /** Make request for the Git Clone API. */
    clone(path: string, url: string): Promise<IGitCloneResult>;
    /** Make request for all git info of repository 'path'
     * (This API is also implicitly used to check if the current repo is a Git repo)
     */
    allHistory(path: string): Promise<IGitAllHistory>;
    /** Make request for top level path of repository 'path' */
    showTopLevel(path: string): Promise<IGitShowTopLevelResult>;
    /** Make request for the prefix path of a directory 'path',
     * with respect to the root directory of repository
     */
    showPrefix(path: string): Promise<IGitShowPrefixResult>;
    /** Make request for git status of repository 'path' */
    status(path: string): Promise<IGitStatusResult>;
    /** Make request for git commit logs of repository 'path' */
    log(path: string): Promise<IGitLogResult>;
    /** Make request for detailed git commit info of
     * commit 'hash' in repository 'path'
     */
    detailedLog(hash: string, path: string): Promise<ISingleCommitFilePathInfo>;
    /** Make request for a list of all git branches in repository 'path' */
    branch(path: string): Promise<IGitBranchResult>;
    /** Make request to add one or all files into
     * the staging area in repository 'path'
     */
    add(check: boolean, filename: string, path: string): Promise<Response>;
    /** Make request to add all untracked files into
     * the staging area in repository 'path'
     */
    addAllUntracked(path: string): Promise<Response>;
    /** Make request to switch current working branch,
     * create new branch if needed,
     * or discard all changes,
     * or discard a specific file change
     * TODO: Refactor into seperate endpoints for each kind of checkout request
     */
    checkout(checkoutBranch: boolean, newCheck: boolean, branchname: string, checkoutAll: boolean, filename: string, path: string): Promise<Response>;
    /** Make request to commit all staged files in repository 'path' */
    commit(message: string, path: string): Promise<Response>;
    /** Make request to move one or all files from the staged to the unstaged area */
    reset(check: boolean, filename: string, path: string): Promise<Response>;
    /** Make request to delete changes from selected commit */
    deleteCommit(message: string, path: string, commitId: string): Promise<Response>;
    /** Make request to reset to selected commit */
    resetToCommit(message: string, path: string, commitId: string): Promise<Response>;
    /** Make request to initialize a  new git repository at path 'path' */
    init(path: string): Promise<Response>;
}
