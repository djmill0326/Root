This is the friend repository for the client-side and manager of the `fakels` architecture.
Do not run, simply place in the correct directory.

* adapter.js is the main server process using the current `fakels` call scheme.
* server discovery is performed by checking for the *first* JS module within the same directory as `adapter.js`. (varies depending on native FS behavior)
* don't run. configure `fakels` correctly, then run `main.js` from the `fakels` *root* while the `cwd` (current dir) is pointing to the desired discovery-aware path.
