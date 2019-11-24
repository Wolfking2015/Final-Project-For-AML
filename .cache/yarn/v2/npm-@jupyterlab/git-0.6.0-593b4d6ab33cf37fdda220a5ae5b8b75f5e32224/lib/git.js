"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const services_1 = require("@jupyterlab/services");
const coreutils_1 = require("@jupyterlab/coreutils");
/** Makes a HTTP request, sending a git command to the backend */
function httpGitRequest(url, method, request) {
    let fullRequest = {
        method: method,
        body: JSON.stringify(request)
    };
    let setting = services_1.ServerConnection.makeSettings();
    let fullUrl = coreutils_1.URLExt.join(setting.baseUrl, url);
    return services_1.ServerConnection.makeRequest(fullUrl, fullRequest, setting);
}
/** Parent class for all API requests */
class Git {
    constructor() { }
    /** Make request for the Git Pull API. */
    pull(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/pull', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for the Git Push API. */
    push(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/push', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for the Git Clone API. */
    clone(path, url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/clone', 'POST', {
                    current_path: path,
                    clone_url: url
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for all git info of repository 'path'
     * (This API is also implicitly used to check if the current repo is a Git repo)
     */
    allHistory(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/all_history', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.text();
                    throw new services_1.ServerConnection.ResponseError(response, data);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for top level path of repository 'path' */
    showTopLevel(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/show_top_level', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for the prefix path of a directory 'path',
     * with respect to the root directory of repository
     */
    showPrefix(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/show_prefix', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for git status of repository 'path' */
    status(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/status', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for git commit logs of repository 'path' */
    log(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/log', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request for detailed git commit info of
     * commit 'hash' in repository 'path'
     */
    detailedLog(hash, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/detailed_log', 'POST', {
                    selected_hash: hash,
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw new services_1.ServerConnection.NetworkError(err);
            }
        });
    }
    /** Make request for a list of all git branches in repository 'path' */
    branch(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/branch', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to add one or all files into
     * the staging area in repository 'path'
     */
    add(check, filename, path) {
        return __awaiter(this, void 0, void 0, function* () {
            return httpGitRequest('/git/add', 'POST', {
                add_all: check,
                filename: filename,
                top_repo_path: path
            });
        });
    }
    /** Make request to add all untracked files into
     * the staging area in repository 'path'
     */
    addAllUntracked(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/add_all_untracked', 'POST', {
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    const data = yield response.json();
                    throw new services_1.ServerConnection.ResponseError(response, data.message);
                }
                return response.json();
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to switch current working branch,
     * create new branch if needed,
     * or discard all changes,
     * or discard a specific file change
     * TODO: Refactor into seperate endpoints for each kind of checkout request
     */
    checkout(checkoutBranch, newCheck, branchname, checkoutAll, filename, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/checkout', 'POST', {
                    checkout_branch: checkoutBranch,
                    new_check: newCheck,
                    branchname: branchname,
                    checkout_all: checkoutAll,
                    filename: filename,
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to commit all staged files in repository 'path' */
    commit(message, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/commit', 'POST', {
                    commit_msg: message,
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to move one or all files from the staged to the unstaged area */
    reset(check, filename, path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/reset', 'POST', {
                    reset_all: check,
                    filename: filename,
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to delete changes from selected commit */
    deleteCommit(message, path, commitId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/delete_commit', 'POST', {
                    commit_id: commitId,
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                yield this.commit(message, path);
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to reset to selected commit */
    resetToCommit(message, path, commitId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/reset_to_commit', 'POST', {
                    commit_id: commitId,
                    top_repo_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
    /** Make request to initialize a  new git repository at path 'path' */
    init(path) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield httpGitRequest('/git/init', 'POST', {
                    current_path: path
                });
                if (response.status !== 200) {
                    return response.json().then((data) => {
                        throw new services_1.ServerConnection.ResponseError(response, data.message);
                    });
                }
                return response;
            }
            catch (err) {
                throw services_1.ServerConnection.NetworkError;
            }
        });
    }
}
exports.Git = Git;
